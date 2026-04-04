import { useEffect, useMemo, useState } from 'react';
import { SmartImage } from '../../components/common/SmartImage';
import { useAdmin } from '../../contexts/AdminContext';
import { getFallbackImage } from '../../data/fallbackImages';

export const AdminCategoriesPage = () => {
  const {
    categories,
    creatingCategory,
    deleteCategory,
    products,
    saveCategory,
    saveSettings,
    settingsDraft,
    setSettingsDraft,
    updateCategory,
    uploadAsset,
  } = useAdmin();
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '' });
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingCategory, setEditingCategory] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const productCounts = useMemo(
    () =>
      products.reduce((accumulator, product) => {
        accumulator[product.category] = (accumulator[product.category] || 0) + 1;
        return accumulator;
      }, {}),
    [products],
  );

  useEffect(() => {
    if (!selectedCategoryId && categories[0]?.id) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

    if (!selectedCategory) {
      return;
    }

    const savedImage = settingsDraft?.storefront?.categoryImages?.[selectedCategory.id];

    setEditingCategory({
      id: selectedCategory.id,
      name: selectedCategory.name,
      description: selectedCategory.description || '',
      image: savedImage || getFallbackImage(selectedCategory.name),
    });
  }, [categories, selectedCategoryId, settingsDraft]);

  const handleCreateCategory = async () => {
    if (!categoryDraft.name.trim()) {
      return;
    }

    await saveCategory(categoryDraft);
    setCategoryDraft({ name: '', description: '' });
  };

  const updateCategoryImageDraft = (url) => {
    setEditingCategory((current) => ({ ...current, image: url }));
    setSettingsDraft((current) => ({
      ...current,
      storefront: {
        ...(current.storefront || {}),
        categoryImages: {
          ...(current.storefront?.categoryImages || {}),
          [editingCategory.id]: url,
        },
      },
    }));
  };

  const handleSaveCategoryEdit = async () => {
    if (!editingCategory.id) {
      return;
    }

    setSavingEdit(true);
    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description,
      });
      await saveSettings({
        ...settingsDraft,
        storefront: {
          ...(settingsDraft.storefront || {}),
          categoryImages: {
            ...(settingsDraft.storefront?.categoryImages || {}),
            [editingCategory.id]: editingCategory.image,
          },
        },
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!category) {
      return;
    }

    if (!window.confirm(`Delete ${category.name}?`)) {
      return;
    }

    await deleteCategory(category.id);
    setSelectedCategoryId('');
  };

  return (
    <section className="admin-two-column">
      <div className="admin-column-stack">
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
              <button
                className={`admin-category-row ${selectedCategoryId === category.id ? 'active' : ''}`.trim()}
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                type="button"
              >
                <SmartImage
                  alt={category.name}
                  className="admin-category-image"
                  src={
                    settingsDraft?.storefront?.categoryImages?.[category.id] ||
                    getFallbackImage(category.name)
                  }
                />
                <div>
                  <strong>{category.name}</strong>
                  <p>{category.description || 'No description yet'}</p>
                </div>
                <div>
                  <strong>{productCounts[category.name] || 0}</strong>
                  <p>Linked products</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Edit category</p>
            <h2>Name, description, and circular image</h2>
          </div>
        </div>

        {editingCategory.id ? (
          <>
            <div className="form-grid">
              <label>
                Category name
                <input
                  onChange={(event) =>
                    setEditingCategory((current) => ({ ...current, name: event.target.value }))
                  }
                  value={editingCategory.name}
                />
              </label>
              <label className="full-width">
                Description
                <textarea
                  onChange={(event) =>
                    setEditingCategory((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows="3"
                  value={editingCategory.description}
                />
              </label>
              <label className="full-width">
                Category image URL
                <input
                  onChange={(event) => updateCategoryImageDraft(event.target.value)}
                  value={editingCategory.image}
                />
              </label>
              <label className="full-width">
                Upload circular image
                <input
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    const upload = await uploadAsset(file);
                    updateCategoryImageDraft(upload.url);
                  }}
                  type="file"
                />
              </label>
            </div>

            <div className="image-preview circle">
              <img alt={editingCategory.name} src={editingCategory.image} />
            </div>

            <div className="row-actions">
              <button
                className="btn btn-primary"
                disabled={savingEdit}
                onClick={handleSaveCategoryEdit}
                type="button"
              >
                {savingEdit ? 'Saving...' : 'Save category'}
              </button>
              <button
                className="btn btn-tertiary"
                onClick={() =>
                  handleDeleteCategory(categories.find((category) => category.id === editingCategory.id))
                }
                type="button"
              >
                Delete category
              </button>
            </div>
          </>
        ) : (
          <p>Select a category to edit its storefront image and text.</p>
        )}
      </div>
    </section>
  );
};
