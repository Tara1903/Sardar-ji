import { useEffect, useRef, useState } from 'react';
import { getFallbackImage } from '../../data/fallbackImages';

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
  });
  const [previewImage, setPreviewImage] = useState('');
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    const nextState = initialProduct
      ? {
          ...initialProduct,
          price: String(initialProduct.price),
          imageFile: null,
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
    setFormState((current) => ({
      ...current,
      [name]: nextValue,
    }));

    if (name === 'category' && !formState.imageFile && !formState.image) {
      setPreviewImage(getFallbackImage(nextValue));
    }
  };

  return (
    <form
      className="panel-card admin-form"
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formState);
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
          <input name="badge" onChange={handleChange} placeholder="Best Seller / Popular / New" value={formState.badge} />
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
