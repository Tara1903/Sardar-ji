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
    <section className="admin-two-column">
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

        <div className="chip-row">
          <button
            className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
            type="button"
          >
            All categories
          </button>
          {categories.map((category) => (
            <button
              className={`filter-chip ${selectedCategory === category.name ? 'active' : ''}`}
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="chip-row">
          {['all', 'available', 'unavailable'].map((option) => (
            <button
              className={`filter-chip ${availabilityFilter === option ? 'active' : ''}`}
              key={option}
              onClick={() => setAvailabilityFilter(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="stack-list admin-list-scroll">
          {filteredProducts.map((product) => (
            <div className="admin-product-row" key={product.id}>
              <SmartImage alt={product.name} className="admin-product-image" src={product.image} />
              <div>
                <strong>{product.name}</strong>
                <p>
                  {product.category} • {formatCurrency(product.price)}
                </p>
                <span>{product.isAvailable ? 'Available' : 'Unavailable'}</span>
              </div>
              <div className="row-actions">
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
