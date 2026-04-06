import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductForm } from '../../components/admin/ProductForm';
import { SmartImage } from '../../components/common/SmartImage';
import { useAdmin } from '../../contexts/AdminContext';
import { formatCurrency } from '../../utils/format';

export const AdminProductsPage = () => {
  const { categories, products, removeProduct, saveProduct, savingProduct } = useAdmin();
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (selectedCategory !== 'All' && product.category !== selectedCategory) {
          return false;
        }

        if (availabilityFilter === 'available' && !product.isAvailable) {
          return false;
        }

        if (availabilityFilter === 'unavailable' && product.isAvailable) {
          return false;
        }

        if (productSearch) {
          const haystack = `${product.name} ${product.description}`.toLowerCase();
          return haystack.includes(productSearch.toLowerCase());
        }

        return true;
      }),
    [availabilityFilter, productSearch, products, selectedCategory],
  );

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this menu item?')) {
      return;
    }

    await removeProduct(productId);
  };

  const handleSaveProduct = async (formState) => {
    await saveProduct(formState, editingProduct);
    setEditingProduct(null);
  };

  return (
    <section className="admin-page-grid">
      <ProductForm
        categories={categories}
        initialProduct={editingProduct}
        key={editingProduct?.id || 'new-product'}
        onCancel={() => setEditingProduct(null)}
        onSubmit={handleSaveProduct}
        saving={savingProduct}
      />

      <div className="panel-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Product search</p>
            <h2>Edit or remove live products</h2>
          </div>
        </div>

        <label className="search-bar compact">
          <Search size={16} />
          <input
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Search menu items"
            value={productSearch}
          />
        </label>

        <div className="admin-form-stack">
          <label>
            Category filter
            <select onChange={(event) => setSelectedCategory(event.target.value)} value={selectedCategory}>
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Availability filter
            <select onChange={(event) => setAvailabilityFilter(event.target.value)} value={availabilityFilter}>
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </label>
        </div>

        <div className="stack-list admin-list-scroll">
          {filteredProducts.map((product) => (
            <div className="admin-list-card admin-product-card" key={product.id}>
              <SmartImage alt={product.name} className="admin-product-image" src={product.image} />
              <div className="admin-card-copy">
                <strong>{product.name}</strong>
                <p>
                  {product.category} • {formatCurrency(product.price)}
                </p>
                <span>{product.isAvailable ? 'Available now' : product.isScheduledOutOfStock ? 'Scheduled out of stock right now' : 'Unavailable'}</span>
                {product.availabilitySchedule?.enabled ? <small>{product.scheduleLabel}</small> : null}
              </div>
              <div className="admin-button-stack">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingProduct(product)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="btn btn-tertiary"
                  onClick={() => handleDeleteProduct(product.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
