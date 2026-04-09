import { useEffect, useRef, useState } from 'react';
import { getFallbackImage } from '../../data/fallbackImages';
import { normalizeAddonGroups } from '../../utils/addons';
import { defaultAvailabilitySchedule, normalizeAvailabilitySchedule } from '../../utils/availability';

const scheduleDays = [
  ['mon', 'Mon'],
  ['tue', 'Tue'],
  ['wed', 'Wed'],
  ['thu', 'Thu'],
  ['fri', 'Fri'],
  ['sat', 'Sat'],
  ['sun', 'Sun'],
];

const createEditorId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

const createEmptyAddonOption = () => ({
  id: createEditorId('addon-option'),
  name: '',
  price: '0',
});

const createEmptyAddonGroup = () => ({
  id: createEditorId('addon-group'),
  title: '',
  selectionType: 'single',
  required: false,
  minSelections: '0',
  maxSelections: '1',
  options: [createEmptyAddonOption()],
});

const mapAddonGroupsToEditorState = (groups = []) =>
  normalizeAddonGroups(groups).map((group) => ({
    ...group,
    minSelections: String(group.minSelections || 0),
    maxSelections: String(group.maxSelections || group.options.length || 1),
    options: group.options.map((option) => ({
      ...option,
      price: String(option.price || 0),
    })),
  }));

const sanitizeAddonGroupsForSave = (groups = []) =>
  normalizeAddonGroups(
    (groups || []).map((group) => ({
      ...group,
      minSelections: Number.parseInt(group.minSelections || 0, 10) || 0,
      maxSelections:
        Number.parseInt(group.maxSelections || group.options?.length || 1, 10) ||
        group.options?.length ||
        1,
      options: (group.options || []).map((option) => ({
        ...option,
        price: Number.parseInt(option.price || 0, 10) || 0,
      })),
    })),
  );

export const ProductForm = ({
  categories,
  initialProduct,
  onSubmit,
  onCancel,
  saving,
}) => {
  const formRef = useRef(null);
  const [formState, setFormState] = useState({
    name: '',
    price: '',
    description: '',
    category: categories[0]?.name || 'Thali Specials',
    badge: '',
    isAvailable: true,
    image: '',
    imageFile: null,
    availabilitySchedule: defaultAvailabilitySchedule,
    addonGroups: [],
  });
  const [previewImage, setPreviewImage] = useState('');
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    const nextState = initialProduct
      ? {
          ...initialProduct,
          price: String(initialProduct.price),
          imageFile: null,
          availabilitySchedule: normalizeAvailabilitySchedule(initialProduct.availabilitySchedule),
          addonGroups: mapAddonGroupsToEditorState(initialProduct.addonGroups || []),
        }
      : {
          name: '',
          price: '',
          description: '',
          category: categories[0]?.name || 'Thali Specials',
          badge: '',
          isAvailable: true,
          image: '',
          imageFile: null,
          availabilitySchedule: normalizeAvailabilitySchedule(defaultAvailabilitySchedule),
          addonGroups: [],
        };
    setFormState(nextState);
    setPreviewImage(nextState.image || getFallbackImage(nextState.category));
  }, [categories, initialProduct]);

  useEffect(() => {
    if (initialProduct && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [initialProduct]);

  useEffect(
    () => () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [objectUrl],
  );

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'file') {
      const file = files?.[0] || null;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      const nextObjectUrl = file ? URL.createObjectURL(file) : '';
      setFormState((current) => ({ ...current, imageFile: file }));
      setObjectUrl(nextObjectUrl);
      setPreviewImage(nextObjectUrl || formState.image || getFallbackImage(formState.category));
      return;
    }

    const nextValue = type === 'checkbox' ? checked : value;

    if (name.startsWith('schedule.')) {
      const scheduleKey = name.replace('schedule.', '');
      setFormState((current) => ({
        ...current,
        availabilitySchedule: normalizeAvailabilitySchedule({
          ...current.availabilitySchedule,
          [scheduleKey]: nextValue,
        }),
      }));
      return;
    }

    setFormState((current) => ({
      ...current,
      [name]: nextValue,
    }));

    if (name === 'category' && !formState.imageFile && !formState.image) {
      setPreviewImage(getFallbackImage(nextValue));
    }
  };

  const updateAddonGroups = (updater) => {
    setFormState((current) => ({
      ...current,
      addonGroups:
        typeof updater === 'function' ? updater(current.addonGroups || []) : updater,
    }));
  };

  const updateAddonGroup = (groupId, updater) => {
    updateAddonGroups((groups) =>
      groups.map((group) =>
        group.id === groupId ? (typeof updater === 'function' ? updater(group) : updater) : group,
      ),
    );
  };

  return (
    <form
      className="panel-card admin-form"
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...formState,
          addonGroups: sanitizeAddonGroupsForSave(formState.addonGroups || []),
        });
      }}
    >
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Product manager</p>
          <h3>{initialProduct ? 'Edit menu item' : 'Add new menu item'}</h3>
        </div>
        {initialProduct ? (
          <button className="btn btn-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
        ) : null}
      </div>

      <div className="admin-form-stack">
        <label>
          Item name
          <input name="name" onChange={handleChange} required value={formState.name} />
        </label>

        <label>
          Price
          <input min="1" name="price" onChange={handleChange} required type="number" value={formState.price} />
        </label>

        <label>
          Category
          <select name="category" onChange={handleChange} value={formState.category}>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Badge
          <input
            name="badge"
            onChange={handleChange}
            placeholder="Best Seller / Popular / New"
            value={formState.badge}
          />
        </label>

        <label>
          Description
          <textarea name="description" onChange={handleChange} required rows="3" value={formState.description} />
        </label>

        <label>
          Product image
          <input accept="image/*" name="imageFile" onChange={handleChange} type="file" />
        </label>

        <label className="availability-toggle admin-toggle-row">
          <input checked={Boolean(formState.isAvailable)} name="isAvailable" onChange={handleChange} type="checkbox" />
          <span>Available for ordering</span>
        </label>

        <div className="admin-subsection">
          <label className="availability-toggle admin-toggle-row">
            <input
              checked={Boolean(formState.availabilitySchedule?.enabled)}
              name="schedule.enabled"
              onChange={handleChange}
              type="checkbox"
            />
            <span>Use out-of-stock schedule</span>
          </label>

          {formState.availabilitySchedule?.enabled ? (
            <>
              <div className="admin-day-grid">
                {scheduleDays.map(([value, label]) => {
                  const isChecked = formState.availabilitySchedule?.days?.includes(value);

                  return (
                    <label className="admin-day-pill" key={value}>
                      <input
                        checked={isChecked}
                        onChange={(event) => {
                          setFormState((current) => {
                            const currentDays = current.availabilitySchedule?.days || [];
                            const nextDays = event.target.checked
                              ? [...new Set([...currentDays, value])]
                              : currentDays.filter((day) => day !== value);

                            return {
                              ...current,
                              availabilitySchedule: normalizeAvailabilitySchedule({
                                ...current.availabilitySchedule,
                                days: nextDays,
                              }),
                            };
                          });
                        }}
                        type="checkbox"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="admin-inline-grid">
                <label>
                  Start time
                  <input
                    name="schedule.startTime"
                    onChange={handleChange}
                    type="time"
                    value={formState.availabilitySchedule?.startTime || '08:00'}
                  />
                </label>

                <label>
                  End time
                  <input
                    name="schedule.endTime"
                    onChange={handleChange}
                    type="time"
                    value={formState.availabilitySchedule?.endTime || '23:00'}
                  />
                </label>
              </div>
            </>
          ) : null}
        </div>

        <div className="admin-subsection">
          <div className="space-between">
            <div>
              <strong>Add-on groups</strong>
              <p className="hint subtle-copy">
                Add optional or required choices like toppings, breads, or premium upgrades.
              </p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => updateAddonGroups((groups) => [...groups, createEmptyAddonGroup()])}
              type="button"
            >
              Add group
            </button>
          </div>

          {formState.addonGroups?.length ? (
            <div className="admin-addon-group-list">
              {formState.addonGroups.map((group, groupIndex) => (
                <div className="admin-addon-group-card" key={group.id}>
                  <div className="space-between">
                    <strong>Group {groupIndex + 1}</strong>
                    <button
                      className="btn btn-tertiary"
                      onClick={() =>
                        updateAddonGroups((groups) => groups.filter((entry) => entry.id !== group.id))
                      }
                      type="button"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="admin-inline-grid">
                    <label>
                      Group title
                      <input
                        onChange={(event) =>
                          updateAddonGroup(group.id, (current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Choose bread / Extra toppings"
                        value={group.title}
                      />
                    </label>

                    <label>
                      Selection type
                      <select
                        onChange={(event) =>
                          updateAddonGroup(group.id, (current) => ({
                            ...current,
                            selectionType: event.target.value,
                            minSelections:
                              event.target.value === 'single'
                                ? String(current.required ? 1 : 0)
                                : current.minSelections,
                            maxSelections:
                              event.target.value === 'single'
                                ? '1'
                                : String(
                                    Math.max(
                                      1,
                                      Number.parseInt(
                                        current.maxSelections || current.options.length || 1,
                                        10,
                                      ) ||
                                        current.options.length ||
                                        1,
                                    ),
                                  ),
                          }))
                        }
                        value={group.selectionType}
                      >
                        <option value="single">Single choice</option>
                        <option value="multiple">Multiple choice</option>
                      </select>
                    </label>
                  </div>

                  <div className="admin-inline-grid">
                    <label className="availability-toggle admin-toggle-row">
                      <input
                        checked={Boolean(group.required)}
                        onChange={(event) =>
                          updateAddonGroup(group.id, (current) => ({
                            ...current,
                            required: event.target.checked,
                            minSelections:
                              current.selectionType === 'single'
                                ? String(event.target.checked ? 1 : 0)
                                : current.minSelections,
                          }))
                        }
                        type="checkbox"
                      />
                      <span>Required</span>
                    </label>

                    {group.selectionType === 'multiple' ? (
                      <>
                        <label>
                          Min choices
                          <input
                            min="0"
                            onChange={(event) =>
                              updateAddonGroup(group.id, (current) => ({
                                ...current,
                                minSelections: event.target.value,
                              }))
                            }
                            type="number"
                            value={group.minSelections}
                          />
                        </label>
                        <label>
                          Max choices
                          <input
                            min="1"
                            onChange={(event) =>
                              updateAddonGroup(group.id, (current) => ({
                                ...current,
                                maxSelections: event.target.value,
                              }))
                            }
                            type="number"
                            value={group.maxSelections}
                          />
                        </label>
                      </>
                    ) : null}
                  </div>

                  <div className="admin-addon-options">
                    {(group.options || []).map((option) => (
                      <div className="admin-addon-option-row" key={option.id}>
                        <label>
                          Option name
                          <input
                            onChange={(event) =>
                              updateAddonGroup(group.id, (current) => ({
                                ...current,
                                options: current.options.map((entry) =>
                                  entry.id === option.id ? { ...entry, name: event.target.value } : entry,
                                ),
                              }))
                            }
                            placeholder="Butter Naan"
                            value={option.name}
                          />
                        </label>
                        <label>
                          Price
                          <input
                            min="0"
                            onChange={(event) =>
                              updateAddonGroup(group.id, (current) => ({
                                ...current,
                                options: current.options.map((entry) =>
                                  entry.id === option.id ? { ...entry, price: event.target.value } : entry,
                                ),
                              }))
                            }
                            type="number"
                            value={option.price}
                          />
                        </label>
                        <button
                          className="btn btn-tertiary"
                          onClick={() =>
                            updateAddonGroup(group.id, (current) => ({
                              ...current,
                              options:
                                current.options.length > 1
                                  ? current.options.filter((entry) => entry.id !== option.id)
                                  : [createEmptyAddonOption()],
                            }))
                          }
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      updateAddonGroup(group.id, (current) => ({
                        ...current,
                        options: [...current.options, createEmptyAddonOption()],
                      }))
                    }
                    type="button"
                  >
                    Add option
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="hint subtle-copy">
              No add-ons yet. Products without add-ons will still add instantly from the menu.
            </p>
          )}
        </div>
      </div>

      <div className="image-preview admin-preview-frame">
        <img alt={formState.name || 'Preview'} src={previewImage || getFallbackImage(formState.category)} />
      </div>

      <div className="admin-button-stack">
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
            }
            setObjectUrl('');
            setFormState((current) => ({ ...current, image: '', imageFile: null }));
            setPreviewImage(getFallbackImage(formState.category));
          }}
          type="button"
        >
          Remove image
        </button>
        <button className="btn btn-primary" disabled={saving} type="submit">
          {saving ? 'Saving...' : initialProduct ? 'Update product' : 'Create product'}
        </button>
      </div>
    </form>
  );
};
