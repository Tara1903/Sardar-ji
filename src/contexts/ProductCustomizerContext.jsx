import { createContext, useContext, useMemo, useState } from 'react';
import { ProductAddonsSheet } from '../components/menu/ProductAddonsSheet';
import { useCart } from './CartContext';
import {
  calculateConfiguredUnitPrice,
  createInitialAddonSelection,
  describeAddons,
  getSelectedAddonDetails,
  hasAddonGroups,
  isAddonSelectionComplete,
} from '../utils/addons';
import { triggerNativeHaptic } from '../lib/nativeFeatures';

const ProductCustomizerContext = createContext(null);

export const ProductCustomizerProvider = ({ children }) => {
  const { addToCart } = useCart();
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [quantity, setQuantity] = useState(1);

  const closeCustomizer = () => {
    setActiveProduct(null);
    setSelectedAddons({});
    setQuantity(1);
  };

  const openCustomizer = (product) => {
    if (!product || !hasAddonGroups(product)) {
      return false;
    }

    setActiveProduct(product);
    setSelectedAddons(createInitialAddonSelection(product.addonGroups || []));
    setQuantity(1);
    void triggerNativeHaptic('light');
    return true;
  };

  const toggleOption = (group, option) => {
    setSelectedAddons((current) => {
      const currentGroupValues = Array.isArray(current?.[group.id]) ? current[group.id] : [];
      const isSelected = currentGroupValues.includes(option.id);

      if (group.selectionType === 'single') {
        return {
          ...current,
          [group.id]: isSelected ? [] : [option.id],
        };
      }

      let nextValues = isSelected
        ? currentGroupValues.filter((value) => value !== option.id)
        : [...currentGroupValues, option.id];

      if (!isSelected && nextValues.length > group.maxSelections) {
        nextValues = nextValues.slice(nextValues.length - group.maxSelections);
      }

      return {
        ...current,
        [group.id]: nextValues,
      };
    });
    void triggerNativeHaptic('light');
  };

  const selectedAddonDetails = useMemo(
    () => getSelectedAddonDetails(activeProduct?.addonGroups || [], selectedAddons),
    [activeProduct, selectedAddons],
  );
  const requiredComplete = useMemo(
    () => isAddonSelectionComplete(activeProduct?.addonGroups || [], selectedAddons),
    [activeProduct, selectedAddons],
  );
  const unitPrice = useMemo(
    () => calculateConfiguredUnitPrice(activeProduct?.price || 0, activeProduct?.addonGroups || [], selectedAddons),
    [activeProduct, selectedAddons],
  );
  const totalPrice = unitPrice * quantity;

  const submitCustomization = () => {
    if (!activeProduct || !requiredComplete) {
      return;
    }

    addToCart(activeProduct, {
      selection: selectedAddons,
      quantity,
    });
    closeCustomizer();
  };

  const value = useMemo(
    () => ({
      openCustomizer,
      closeCustomizer,
      isOpen: Boolean(activeProduct),
    }),
    [activeProduct],
  );

  return (
    <ProductCustomizerContext.Provider value={value}>
      {children}
      <ProductAddonsSheet
        onClose={closeCustomizer}
        onDecreaseQuantity={() => setQuantity((current) => Math.max(1, current - 1))}
        onIncreaseQuantity={() => setQuantity((current) => current + 1)}
        onSubmit={submitCustomization}
        onToggleOption={toggleOption}
        open={Boolean(activeProduct)}
        product={activeProduct}
        quantity={quantity}
        requiredComplete={requiredComplete}
        selectedAddons={selectedAddons}
        selectedAddonsLabel={describeAddons(selectedAddonDetails)}
        totalPrice={totalPrice}
      />
    </ProductCustomizerContext.Provider>
  );
};

export const useProductCustomizer = () => {
  const context = useContext(ProductCustomizerContext);

  if (!context) {
    throw new Error('useProductCustomizer must be used inside ProductCustomizerProvider');
  }

  return context;
};
