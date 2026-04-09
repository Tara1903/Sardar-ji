const roundPrice = (value) => Math.round(Number(value || 0));

const slugifyAddonValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeAddonOption = (option = {}, groupId, optionIndex = 0) => ({
  id: String(option.id || `${groupId}-option-${optionIndex + 1}`).trim(),
  name: String(option.name || '').trim(),
  price: roundPrice(option.price || 0),
  productId: String(option.productId || '').trim(),
  defaultSelected: Boolean(option.defaultSelected),
});

export const normalizeAddonGroups = (groups = []) =>
  (Array.isArray(groups) ? groups : [])
    .map((group, groupIndex) => {
      const title = String(group.title || group.name || '').trim();
      const groupId = String(group.id || slugifyAddonValue(title) || `group-${groupIndex + 1}`).trim();
      const selectionType = group.selectionType === 'multiple' ? 'multiple' : 'single';
      const options = (Array.isArray(group.options) ? group.options : [])
        .map((option, optionIndex) => normalizeAddonOption(option, groupId, optionIndex))
        .filter((option) => option.name);

      if (!title || !options.length) {
        return null;
      }

      return {
        id: groupId,
        title,
        selectionType,
        required: Boolean(group.required),
        minSelections:
          selectionType === 'multiple'
            ? Math.max(0, Number.parseInt(group.minSelections || 0, 10) || 0)
            : Boolean(group.required)
              ? 1
              : 0,
        maxSelections:
          selectionType === 'multiple'
            ? Math.max(1, Number.parseInt(group.maxSelections || options.length, 10) || options.length)
            : 1,
        options,
      };
    })
    .filter(Boolean);

export const normalizeProductAddonGroups = (product, productAddonGroups = {}) => {
  const keyCandidates = [product?.id, product?.slug, product?.name].map((value) => String(value || '').trim());
  const matchedKey = keyCandidates.find((key) => key && productAddonGroups?.[key]);
  return normalizeAddonGroups(matchedKey ? productAddonGroups?.[matchedKey] : product?.addonGroups || []);
};

export const hasAddonGroups = (product) => normalizeAddonGroups(product?.addonGroups).length > 0;

export const createInitialAddonSelection = (addonGroups = []) =>
  normalizeAddonGroups(addonGroups).reduce((selection, group) => {
    const defaultOptionIds = group.options.filter((option) => option.defaultSelected).map((option) => option.id);

    if (!defaultOptionIds.length) {
      selection[group.id] = [];
      return selection;
    }

    selection[group.id] =
      group.selectionType === 'single' ? [defaultOptionIds[0]] : defaultOptionIds.slice(0, group.maxSelections);
    return selection;
  }, {});

export const sanitizeAddonSelection = (selection = {}, addonGroups = []) =>
  normalizeAddonGroups(addonGroups).reduce((nextSelection, group) => {
    const currentValues = Array.isArray(selection?.[group.id]) ? selection[group.id] : [];
    const validValues = currentValues.filter((value) => group.options.some((option) => option.id === value));

    nextSelection[group.id] =
      group.selectionType === 'single' ? validValues.slice(0, 1) : validValues.slice(0, group.maxSelections);
    return nextSelection;
  }, {});

export const isAddonSelectionComplete = (addonGroups = [], selection = {}) =>
  normalizeAddonGroups(addonGroups).every((group) => {
    const selectedOptionIds = Array.isArray(selection?.[group.id]) ? selection[group.id] : [];
    const requiredCount = group.selectionType === 'single' ? Number(group.required) : group.minSelections;
    return selectedOptionIds.length >= requiredCount;
  });

export const getSelectedAddonDetails = (addonGroups = [], selection = {}) =>
  normalizeAddonGroups(addonGroups).flatMap((group) => {
    const selectedOptionIds = Array.isArray(selection?.[group.id]) ? selection[group.id] : [];
    return selectedOptionIds
      .map((optionId) => group.options.find((option) => option.id === optionId))
      .filter(Boolean)
      .map((option) => ({
        id: option.id,
        name: option.name,
        price: option.price,
        productId: option.productId,
        groupId: group.id,
        groupTitle: group.title,
      }));
  });

export const calculateAddonUnitTotal = (addonGroups = [], selection = {}) =>
  roundPrice(
    getSelectedAddonDetails(addonGroups, selection).reduce((total, option) => total + Number(option.price || 0), 0),
  );

export const calculateConfiguredUnitPrice = (basePrice, addonGroups = [], selection = {}) =>
  roundPrice(basePrice) + calculateAddonUnitTotal(addonGroups, selection);

export const buildAddonLineId = (productId, addons = []) => {
  const normalizedProductId = String(productId || '').trim();
  const encodedAddons = (addons || [])
    .map((addon) => `${addon.groupId}:${addon.id}`)
    .sort()
    .join('|');

  return encodedAddons ? `${normalizedProductId}::${encodedAddons}` : normalizedProductId;
};

export const describeAddons = (addons = []) => (addons || []).map((addon) => addon.name).join(', ');

export const buildConfiguredCartItem = ({
  product,
  addonGroups = [],
  selection = {},
  quantity = 1,
}) => {
  const normalizedGroups = normalizeAddonGroups(addonGroups);
  const normalizedSelection = sanitizeAddonSelection(selection, normalizedGroups);
  const addons = getSelectedAddonDetails(normalizedGroups, normalizedSelection);
  const basePrice = roundPrice(product?.price || 0);
  const addonTotal = calculateAddonUnitTotal(normalizedGroups, normalizedSelection);
  const price = basePrice + addonTotal;
  const lineId = buildAddonLineId(product?.id, addons);

  return {
    ...product,
    id: product?.id,
    lineId,
    basePrice,
    addonTotal,
    price,
    quantity: Math.max(1, Number.parseInt(quantity || 1, 10) || 1),
    addons,
    addonSummary: describeAddons(addons),
  };
};

export const expandCartItemsForOrder = (items = []) =>
  (items || []).flatMap((item) => {
    if (item.isFreebie) {
      return [{ ...item, lineId: item.lineId || item.id }];
    }

    const baseLine = {
      ...item,
      lineId: item.lineId || item.id,
      basePrice: roundPrice(item.basePrice ?? item.price ?? 0),
      price: roundPrice(item.basePrice ?? item.price ?? 0),
      addons: [],
      addonSummary: '',
    };

    const addonLines = normalizeCartAddons(item.addons || [])
      .filter((addon) => addon.productId)
      .map((addon) => ({
        id: addon.productId,
        lineId: `${baseLine.lineId}::addon::${addon.groupId}:${addon.id}`,
        name: addon.name,
        quantity: baseLine.quantity,
        price: addon.price,
        basePrice: addon.price,
        addonTotal: 0,
        isAddonLine: true,
        parentLineId: baseLine.lineId,
        parentProductId: baseLine.id,
        parentName: baseLine.name,
        groupId: addon.groupId,
        groupTitle: addon.groupTitle,
      }));

    return [baseLine, ...addonLines];
  });

export const normalizeCartAddons = (addons = []) =>
  (Array.isArray(addons) ? addons : [])
    .map((addon) => ({
      id: String(addon.id || '').trim(),
      name: String(addon.name || '').trim(),
      price: roundPrice(addon.price || 0),
      productId: String(addon.productId || '').trim(),
      groupId: String(addon.groupId || '').trim(),
      groupTitle: String(addon.groupTitle || '').trim(),
    }))
    .filter((addon) => addon.id && addon.name);

export const normalizeCartItem = (item = {}) => {
  const addons = normalizeCartAddons(item.addons || []);
  const baseId = String(item.id || item.productId || '').trim();
  const addonTotal = roundPrice(
    item.addonTotal !== undefined
      ? item.addonTotal
      : addons.reduce((total, addon) => total + Number(addon.price || 0), 0),
  );
  const price = roundPrice(item.price || 0);
  const basePrice =
    item.basePrice !== undefined
      ? roundPrice(item.basePrice)
      : roundPrice(Math.max(0, price - addonTotal));

  return {
    ...item,
    id: baseId,
    lineId: String(item.lineId || buildAddonLineId(baseId, addons)).trim(),
    basePrice,
    addonTotal,
    price: price || basePrice + addonTotal,
    quantity: Math.max(1, Number.parseInt(item.quantity || 1, 10) || 1),
    addons,
    addonSummary: item.addonSummary || describeAddons(addons),
  };
};

export const collapseOrderItems = (items = []) => {
  const normalizedItems = (Array.isArray(items) ? items : []).map(normalizeCartItem);
  const addonLinesByParent = normalizedItems
    .filter((item) => item.isAddonLine && item.parentLineId)
    .reduce((grouped, item) => {
      grouped[item.parentLineId] = grouped[item.parentLineId] || [];
      grouped[item.parentLineId].push({
        id: item.lineId || item.id,
        name: item.name,
        price: roundPrice(item.price || item.basePrice || 0),
        groupId: item.groupId || '',
        groupTitle: item.groupTitle || '',
      });
      return grouped;
    }, {});

  return normalizedItems
    .filter((item) => !item.isAddonLine)
    .map((item) => {
      const attachedAddons = [
        ...normalizeCartAddons(item.addons || []),
        ...(addonLinesByParent[item.lineId || item.id] || []),
      ];
      const addonSummary = describeAddons(attachedAddons);
      const addonTotal = roundPrice(
        attachedAddons.reduce((total, addon) => total + Number(addon.price || 0), 0),
      );
      const basePrice =
        item.basePrice !== undefined ? roundPrice(item.basePrice) : roundPrice(item.price || 0);

      return {
        ...item,
        addons: attachedAddons,
        addonTotal,
        addonSummary,
        price: item.isFreebie ? 0 : basePrice + addonTotal,
        basePrice,
      };
    });
};

export const getProductCartQuantity = (items = [], productId = '') =>
  (items || [])
    .filter((item) => item.id === productId && !item.isFreebie)
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

export const getProductCartLines = (items = [], productId = '') =>
  (items || []).filter((item) => item.id === productId && !item.isFreebie);

export const serializeAddonGroupsMap = (map = {}) =>
  Object.entries(map || {}).reduce((nextMap, [key, value]) => {
    const normalizedGroups = normalizeAddonGroups(value);

    if (normalizedGroups.length) {
      nextMap[key] = normalizedGroups;
    }

    return nextMap;
  }, {});

export const collectAddonShadowProductIds = (map = {}) =>
  Object.values(serializeAddonGroupsMap(map)).flatMap((groups) =>
    groups.flatMap((group) =>
      group.options.map((option) => option.productId).filter(Boolean),
    ),
  );
