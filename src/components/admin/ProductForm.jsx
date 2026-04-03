import { useEffect, useState } from 'react';
import { getFallbackImage } from '../../data/fallbackImages';

export const ProductForm = ({
  categories,
  initialProduct,
  onSubmit,
  onCancel,
  saving,
}) => {
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

  useEffect(() => {
    const nextState = initialProduct
      ? {
          ...initialProduct,
          price: initialProduct.price,
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

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'file') {
      const file = files?.[0] || null;
      setFormState((current) => ({ ...current, imageFile: file }));
      setPreviewImage(file ? URL.createObjectURL(file) : getFallbackImage(formState.category));
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
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formState);
      }}
    >
      <div className="space-between">
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

      <div className="form-grid">
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
        <label className="full-width">
          Description
          <textarea name="description" onChange={handleChange} required rows="3" value={formState.description} />
        </label>
        <label>
          Product image
          <input accept="image/*" name="imageFile" onChange={handleChange} type="file" />
        </label>
        <label className="availability-toggle">
          <input checked={Boolean(formState.isAvailable)} name="isAvailable" onChange={handleChange} type="checkbox" />
          Available for ordering
        </label>
      </div>

      <div className="image-preview">
        <img alt={formState.name || 'Preview'} src={previewImage || getFallbackImage(formState.category)} />
        <button
          className="btn btn-secondary"
          onClick={() => {
            setFormState((current) => ({ ...current, image: '', imageFile: null }));
            setPreviewImage(getFallbackImage(formState.category));
          }}
          type="button"
        >
          Remove image
        </button>
      </div>

      <button className="btn btn-primary" disabled={saving} type="submit">
        {saving ? 'Saving...' : initialProduct ? 'Update product' : 'Create product'}
      </button>
    </form>
  );
};
