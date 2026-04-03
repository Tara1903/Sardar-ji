import { useMemo, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

export const AdminCategoriesPage = () => {
  const { categories, creatingCategory, products, saveCategory } = useAdmin();
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '' });

  const productCounts = useMemo(
    () =>
      products.reduce((accumulator, product) => {
        accumulator[product.category] = (accumulator[product.category] || 0) + 1;
        return accumulator;
      }, {}),
    [products],
  );

  const handleCreateCategory = async () => {
    if (!categoryDraft.name.trim()) {
      return;
    }

    await saveCategory(categoryDraft);
    setCategoryDraft({ name: '', description: '' });
  };

  return (
    <section className="admin-two-column">
      <div className="panel-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Add a new category</h2>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Category name
            <input
              onChange={(event) =>
                setCategoryDraft((current) => ({ ...current, name: event.target.value }))
              }
              value={categoryDraft.name}
            />
          </label>
          <label className="full-width">
            Description
            <textarea
              onChange={(event) =>
                setCategoryDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows="3"
              value={categoryDraft.description}
            />
          </label>
        </div>

        <button
          className="btn btn-primary"
          disabled={creatingCategory}
          onClick={handleCreateCategory}
          type="button"
        >
          {creatingCategory ? 'Creating...' : 'Create category'}
        </button>
      </div>

      <div className="panel-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Category list</p>
            <h2>Current menu sections</h2>
          </div>
        </div>

        <div className="stack-list admin-list-scroll">
          {categories.map((category) => (
            <div className="order-row" key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <p>{category.description || 'No description yet'}</p>
              </div>
              <div>
                <strong>{productCounts[category.name] || 0}</strong>
                <p>Linked products</p>
              </div>
              <span
                className={`status-pill ${category.isActive ? 'status-delivered' : 'status-order-placed'}`}
              >
                {category.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
