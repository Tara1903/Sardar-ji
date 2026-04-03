import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, LogOut, Search, ShoppingBasket, Users } from 'lucide-react';
import { api } from '../api/client';
import { ProductForm } from '../components/admin/ProductForm';
import { Loader } from '../components/common/Loader';
import { SmartImage } from '../components/common/SmartImage';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime } from '../utils/format';

export const AdminPage = () => {
  const { token, logout } = useAuth();
  const {
    products,
    categories,
    settings,
    refreshCatalog,
    refreshSettings,
  } = useAppData();
  const [orders, setOrders] = useState([]);
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '' });
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [orderDrafts, setOrderDrafts] = useState({});
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordersResponse, deliveryResponse, customersResponse] = await Promise.all([
        api.getOrders(token),
        api.getUsers('delivery', token),
        api.getUsers('customer', token),
      ]);
      setOrders(ordersResponse);
      setDeliveryUsers(deliveryResponse);
      setCustomers(customersResponse);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  useEffect(() => {
    if (settings) {
      setSettingsDraft(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

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

  const handleProductSave = async (formState) => {
    setSavingProduct(true);
    try {
      let imageUrl = formState.image;
      if (formState.imageFile) {
        const upload = await api.uploadImage(formState.imageFile, token);
        imageUrl = upload.url;
      }

      const payload = {
        name: formState.name,
        price: Number(formState.price),
        description: formState.description,
        category: formState.category,
        badge: formState.badge,
        isAvailable: Boolean(formState.isAvailable),
        image: imageUrl || '',
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload, token);
      } else {
        await api.createProduct(payload, token);
      }

      await refreshCatalog();
      setEditingProduct(null);
      setError('');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this menu item?')) {
      return;
    }
    await api.deleteProduct(id, token);
    refreshCatalog();
  };

  const handleCreateCategory = async () => {
    if (!categoryDraft.name) {
      return;
    }
    await api.createCategory(categoryDraft, token);
    setCategoryDraft({ name: '', description: '' });
    refreshCatalog();
  };

  const updateOrderDraft = (orderId, key, value) => {
    setOrderDrafts((current) => ({
      ...current,
      [orderId]: {
        status: current[orderId]?.status || orders.find((order) => order.id === orderId)?.status || 'Order Placed',
        assignedDeliveryBoyId:
          current[orderId]?.assignedDeliveryBoyId ||
          orders.find((order) => order.id === orderId)?.assignedDeliveryBoyId ||
          '',
        [key]: value,
      },
    }));
  };

  const saveOrderUpdate = async (orderId) => {
    const fallback = orders.find((order) => order.id === orderId);
    const draft = orderDrafts[orderId] || {
      status: fallback.status,
      assignedDeliveryBoyId: fallback.assignedDeliveryBoyId,
    };
    await api.updateOrderStatus(orderId, draft, token);
    loadAdminData();
  };

  const handleSaveSettings = async () => {
    if (!settingsDraft) {
      return;
    }
    await api.updateSettings(settingsDraft, token);
    refreshSettings();
  };

  if (loading || !settingsDraft) {
    return <Loader message="Loading admin control room..." />;
  }

  return (
    <div className="panel-page">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h1>Sardar Ji Food Corner control room</h1>
        </div>
        <button className="btn btn-secondary" onClick={logout} type="button">
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <main className="panel-content">
        <section className="metrics-grid">
          <article className="panel-card">
            <LayoutDashboard size={18} />
            <strong>{products.length}</strong>
            <span>Live products</span>
          </article>
          <article className="panel-card">
            <ShoppingBasket size={18} />
            <strong>{orders.length}</strong>
            <span>Total orders</span>
          </article>
          <article className="panel-card">
            <Users size={18} />
            <strong>{customers.length}</strong>
            <span>Customers tracked</span>
          </article>
        </section>

        {error ? <p className="error-text spaced">{error}</p> : null}

        <section className="admin-grid">
          <ProductForm
            categories={categories}
            initialProduct={editingProduct}
            onCancel={() => setEditingProduct(null)}
            onSubmit={handleProductSave}
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
              <input onChange={(event) => setProductSearch(event.target.value)} placeholder="Search menu items" value={productSearch} />
            </label>

            <div className="chip-row">
              <button className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')} type="button">
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

            <div className="stack-list">
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
                    <button className="btn btn-secondary" onClick={() => setEditingProduct(product)} type="button">
                      Edit
                    </button>
                    <button className="btn btn-tertiary" onClick={() => handleDeleteProduct(product.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-grid">
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
                <input onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} value={categoryDraft.name} />
              </label>
              <label className="full-width">
                Description
                <textarea onChange={(event) => setCategoryDraft((current) => ({ ...current, description: event.target.value }))} rows="3" value={categoryDraft.description} />
              </label>
            </div>
            <button className="btn btn-primary" onClick={handleCreateCategory} type="button">
              Create category
            </button>
          </div>

          <div className="panel-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Business settings</p>
                <h2>Offers, delivery rules, and footer info</h2>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Business name
                <input onChange={(event) => setSettingsDraft((current) => ({ ...current, businessName: event.target.value }))} value={settingsDraft.businessName} />
              </label>
              <label>
                Tagline
                <input onChange={(event) => setSettingsDraft((current) => ({ ...current, tagline: event.target.value }))} value={settingsDraft.tagline} />
              </label>
              <label>
                Phone number
                <input onChange={(event) => setSettingsDraft((current) => ({ ...current, phoneNumber: event.target.value }))} value={settingsDraft.phoneNumber} />
              </label>
              <label>
                WhatsApp number
                <input onChange={(event) => setSettingsDraft((current) => ({ ...current, whatsappNumber: event.target.value }))} value={settingsDraft.whatsappNumber} />
              </label>
              <label>
                Timings
                <input onChange={(event) => setSettingsDraft((current) => ({ ...current, timings: event.target.value }))} value={settingsDraft.timings} />
              </label>
              <label>
                Maps embed URL
                <input onChange={(event) => setSettingsDraft((current) => ({ ...current, mapsEmbedUrl: event.target.value }))} value={settingsDraft.mapsEmbedUrl} />
              </label>
              <label>
                Free delivery threshold
                <input
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      deliveryRules: {
                        ...current.deliveryRules,
                        freeDeliveryThreshold: Number(event.target.value),
                      },
                    }))
                  }
                  type="number"
                  value={settingsDraft.deliveryRules.freeDeliveryThreshold}
                />
              </label>
              <label>
                Delivery fee below threshold
                <input
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      deliveryRules: {
                        ...current.deliveryRules,
                        deliveryFeeBelowThreshold: Number(event.target.value),
                      },
                    }))
                  }
                  type="number"
                  value={settingsDraft.deliveryRules.deliveryFeeBelowThreshold}
                />
              </label>
              <label>
                Handling fee below threshold
                <input
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      deliveryRules: {
                        ...current.deliveryRules,
                        handlingFeeBelowThreshold: Number(event.target.value),
                      },
                    }))
                  }
                  type="number"
                  value={settingsDraft.deliveryRules.handlingFeeBelowThreshold}
                />
              </label>
              <label>
                ETA in minutes
                <input
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      deliveryRules: {
                        ...current.deliveryRules,
                        estimatedDeliveryMinutes: Number(event.target.value),
                      },
                    }))
                  }
                  type="number"
                  value={settingsDraft.deliveryRules.estimatedDeliveryMinutes}
                />
              </label>
            </div>

            <div className="stack-list">
              {settingsDraft.offers.map((offer, index) => (
                <div className="offer-editor" key={offer.id}>
                  <input
                    onChange={(event) =>
                      setSettingsDraft((current) => ({
                        ...current,
                        offers: current.offers.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, title: event.target.value } : item,
                        ),
                      }))
                    }
                    value={offer.title}
                  />
                  <textarea
                    onChange={(event) =>
                      setSettingsDraft((current) => ({
                        ...current,
                        offers: current.offers.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, description: event.target.value } : item,
                        ),
                      }))
                    }
                    rows="2"
                    value={offer.description}
                  />
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={handleSaveSettings} type="button">
              Save settings
            </button>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Order management</p>
              <h2>Update status and assign delivery partners</h2>
            </div>
          </div>

          <label className="search-bar compact">
            <Search size={16} />
            <input onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search by order ID or customer" value={orderSearch} />
          </label>

          <div className="orders-list">
            {orders
              .filter((order) =>
                `${order.orderNumber} ${order.customerName}`.toLowerCase().includes(orderSearch.toLowerCase()),
              )
              .map((order) => {
                const draft = orderDrafts[order.id] || {
                  status: order.status,
                  assignedDeliveryBoyId: order.assignedDeliveryBoyId || '',
                };

                return (
                  <div className="admin-order-row" key={order.id}>
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>
                        {order.customerName} • {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <strong>{formatCurrency(order.total)}</strong>
                      <p>{order.address.fullAddress}</p>
                    </div>
                    <select onChange={(event) => updateOrderDraft(order.id, 'status', event.target.value)} value={draft.status}>
                      {['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <select
                      onChange={(event) => updateOrderDraft(order.id, 'assignedDeliveryBoyId', event.target.value)}
                      value={draft.assignedDeliveryBoyId}
                    >
                      <option value="">Assign delivery boy</option>
                      {deliveryUsers.map((delivery) => (
                        <option key={delivery.id} value={delivery.id}>
                          {delivery.name}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-secondary" onClick={() => saveOrderUpdate(order.id)} type="button">
                      Save
                    </button>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Referral analytics</p>
              <h2>See who is driving repeat growth</h2>
            </div>
          </div>
          <div className="orders-list">
            {customers.map((customer) => (
              <div className="order-row" key={customer.id}>
                <div>
                  <strong>{customer.name}</strong>
                  <p>{customer.email}</p>
                </div>
                <div>
                  <strong>{customer.referralCode}</strong>
                  <p>{customer.successfulReferrals?.length || 0} successful referrals</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
