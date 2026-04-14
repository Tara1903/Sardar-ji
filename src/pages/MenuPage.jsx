import { useMemo } from 'react';
import { Filter, MapPin, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PromoBanner } from '../components/common/PromoBanner';
import { EmptyState } from '../components/common/EmptyState';
import { PageTransition } from '../components/common/PageTransition';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { QuickChips } from '../components/home/QuickChips';
import { FeaturedProductsGrid } from '../components/home/FeaturedProductsGrid';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { isNativeAppShell } from '../lib/nativeApp';
import { createComboOffers, sortProductsByCategoryAndPrice } from '../utils/catalog';
import { formatCurrency } from '../utils/format';
import { getCartOfferState } from '../utils/pricing';
import { useStoreDistance } from '../hooks/useStoreDistance';
import { createBreadcrumbSchema, createFaqSchema } from '../seo/siteSeo';
import { APP_QUICK_CHIPS, filterProductsByQuickChip } from '../data/appExperience';

const priceFilters = [
  { label: 'All prices', value: 'all' },
  { label: 'Under ₹100', value: 'under100' },
  { label: '₹100 to ₹300', value: '100to300' },
  { label: 'Above ₹300', value: 'above300' },
];

const applyPriceFilter = (product, priceFilter) => {
  if (priceFilter === 'under100') {
    return product.price < 100;
  }

  if (priceFilter === '100to300') {
    return product.price >= 100 && product.price <= 300;
  }

  if (priceFilter === 'above300') {
    return product.price > 300;
  }

  return true;
};

export const MenuPage = () => {
  const { appConfig, products, categories, settings, loading } = useAppData();
  const { items, addItemsToCart, itemCount } = useCart();
  const { distanceKm, isLocating, locationStatus } = useStoreDistance();
  const [searchParams, setSearchParams] = useSearchParams();
  const nativeAppShell = isNativeAppShell();
  const offersConfig = appConfig.offers || {};
  const railCategories = appConfig.categories?.length ? appConfig.categories : categories;
  const categoryParam = searchParams.get('category') || 'All';
  const chipParam = searchParams.get('chip') || 'all';
  const priceFilter = searchParams.get('price') || 'all';
  const search = searchParams.get('search') || '';
  const comboOffers = useMemo(() => createComboOffers(products), [products]);
  const cartOfferState = getCartOfferState(items, products, settings?.deliveryRules, 0, distanceKm);
  const faqItems = [
    {
      question: 'Can I browse the full menu quickly on my phone?',
      answer:
        'Yes, the menu is organized as an app-like browse screen with quick chips, categories, and direct add-to-cart actions.',
    },
    {
      question: 'Does the menu include pure veg thalis and tiffin options?',
      answer:
        'Yes, Sardar Ji Food Corner focuses on pure veg meals including thalis, tiffin-style dishes, snacks, drinks, and related meal picks.',
    },
    {
      question: 'Will I see my delivery rewards while browsing?',
      answer:
        'Yes, the menu keeps a live cart reward summary visible so customers can understand delivery savings before checkout.',
    },
  ];

  const filteredProducts = useMemo(() => {
    const visibleProducts = sortProductsByCategoryAndPrice(
      products.filter((product) => product.isAvailable),
      railCategories,
    );

    return filterProductsByQuickChip(visibleProducts, chipParam).filter((product) => {
      if (categoryParam !== 'All' && product.category !== categoryParam) {
        return false;
      }

      if (search) {
        const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) {
          return false;
        }
      }

      return applyPriceFilter(product, priceFilter);
    });
  }, [categoryParam, chipParam, priceFilter, products, railCategories, search]);

  const updateFilter = (key, value, resetKeys = []) => {
    const nextParams = new URLSearchParams(searchParams);

    resetKeys.forEach((resetKey) => nextParams.delete(resetKey));

    if (!value || value === 'all' || value === 'All') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    nextParams.delete('chip');
    nextParams.delete('price');
    nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
  };

  if (nativeAppShell) {
    return (
      <PageTransition>
        <SeoMeta
          description="Browse the pure veg menu from Sardar Ji Food Corner with fast filters, quick adds, and food delivery ordering in Indore."
          includeLocalBusiness
          keywords={[
            'food delivery in Indore',
            'veg menu Indore',
            'thali menu Indore',
            'pure veg food delivery Indore',
            'monthly thali plan Indore',
          ]}
          path="/menu"
          schema={[
            createBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Menu', path: '/menu' },
            ]),
            createFaqSchema(faqItems),
          ]}
          settings={settings}
          title="Pure Veg Menu in Indore | Sardar Ji Food Corner"
        />

        <section className="section first-section native-browse-screen">
          <div className="container native-screen-stack">
            <div className="native-screen-hero native-screen-hero-compact">
              <div>
                <p className="eyebrow">Browse menu</p>
                <h1>Search first, filter fast, and add food without leaving the flow.</h1>
              </div>
              <div className="native-screen-hero-meta">
                <span className="hero-chip">
                  <Sparkles size={14} />
                  {filteredProducts.length} dishes
                </span>
                <span className="hero-chip">
                  <MapPin size={14} />
                  {isLocating ? 'Checking distance...' : locationStatus}
                </span>
                {distanceKm !== null ? <span className="hero-chip">{distanceKm.toFixed(1)} km</span> : null}
              </div>
            </div>

            <div className="native-toolbar-card">
              <div className="native-toolbar-group">
                <p className="eyebrow">Quick chips</p>
                <QuickChips activeChip={chipParam} chips={APP_QUICK_CHIPS} onSelectChip={(value) => updateFilter('chip', value)} />
              </div>

              <div className="native-toolbar-group">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Categories</p>
                    <h2>Jump faster</h2>
                  </div>
                </div>
                <CategoryShowcase
                  activeCategory={categoryParam}
                  categories={railCategories}
                  onSelectCategory={(value) => updateFilter('category', value)}
                />
              </div>

              <div className="native-toolbar-group">
                <div className="app-menu-filter-heading">
                  <div>
                    <p className="eyebrow">Spend range</p>
                    <h3>Keep pricing visible</h3>
                  </div>
                  <button className="btn btn-secondary app-menu-reset-button" onClick={clearFilters} type="button">
                    <Filter size={16} />
                    Reset
                  </button>
                </div>
                <div className="app-filter-strip">
                  {priceFilters.map((filter) => (
                    <button
                      className={`quick-chip ${priceFilter === filter.value ? 'active' : ''}`.trim()}
                      key={filter.value}
                      onClick={() => updateFilter('price', filter.value)}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="native-toolbar-summary">
                <strong>{itemCount ? `${itemCount} item${itemCount > 1 ? 's' : ''} in cart` : 'No items in cart yet'}</strong>
                <span>
                  {itemCount
                    ? `${cartOfferState.offerMessage} • ${formatCurrency(cartOfferState.total)}`
                    : 'Add dishes directly from this grid and move straight into cart.'}
                </span>
                <div className="native-toolbar-actions">
                  <Link className="btn btn-secondary" to="/my-subscription?checkout=1">
                    Plan options
                  </Link>
                  <Link className="btn btn-primary" to={itemCount ? '/cart' : '/checkout'}>
                    {itemCount ? 'Open cart' : 'Checkout'}
                  </Link>
                </div>
              </div>
            </div>

            {filteredProducts.length ? (
              <FeaturedProductsGrid
                description="This is the fastest path from browse to basket inside the native app."
                eyebrow="Browse results"
                loading={loading}
                products={filteredProducts}
                title="Tap to add"
                whatsappNumber={settings?.whatsappNumber}
              />
            ) : (
              <EmptyState
                action={
                  <button className="btn btn-primary" onClick={clearFilters} type="button">
                    Clear filters
                  </button>
                }
                description="Try a different chip, category, or price range."
                title="No dishes match these filters"
              />
            )}

            {comboOffers.length ? (
              <section className="native-app-section">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Combo shortcuts</p>
                    <h2>Build a fuller basket faster</h2>
                  </div>
                </div>
                <div className="app-plan-grid">
                  {comboOffers.map((combo) => (
                    <article className="app-plan-card" key={combo.id}>
                      <p className="eyebrow">Combo pick</p>
                      <h3>{combo.title}</h3>
                      <p>{combo.description}</p>
                      <strong>{formatCurrency(combo.total)}</strong>
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          addItemsToCart(
                            combo.items.map((item) => ({
                              ...item,
                              quantity: 1,
                            })),
                          )
                        }
                        type="button"
                      >
                        Add combo
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SeoMeta
        description="Browse the pure veg menu from Sardar Ji Food Corner with fast filters, quick adds, and food delivery ordering in Indore."
        includeLocalBusiness
        keywords={[
          'food delivery in Indore',
          'veg menu Indore',
          'thali menu Indore',
          'pure veg food delivery Indore',
          'monthly thali plan Indore',
        ]}
        path="/menu"
        schema={[
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Menu', path: '/menu' },
          ]),
          createFaqSchema(faqItems),
        ]}
        settings={settings}
        title="Pure Veg Menu in Indore | Sardar Ji Food Corner"
      />

      <section className="section first-section app-menu-shell">
        <div className="container app-menu-stack">
          <div className="app-menu-hero">
            <div className="app-menu-hero-copy">
              <p className="eyebrow">Browse the menu</p>
              <h1>Pick your meal and keep the order moving</h1>
              <p className="section-heading-note">
                The search bar at the top works from anywhere. Use these chips and categories to narrow the menu even faster.
              </p>
            </div>
            <div className="app-menu-hero-stats">
              <span className="hero-chip">
                <Sparkles size={14} />
                {filteredProducts.length} dishes visible
              </span>
              <span className="hero-chip">
                <MapPin size={14} />
                {isLocating ? 'Checking distance...' : locationStatus}
              </span>
              {distanceKm !== null ? <span className="hero-chip">{distanceKm.toFixed(1)} km</span> : null}
            </div>
          </div>

          <PromoBanner
            actions={
              <>
                <Link className="btn btn-primary" to="/my-subscription?checkout=1">
                  Buy Monthly Plan
                </Link>
                <Link className="btn btn-secondary" to={itemCount ? '/cart' : '/checkout'}>
                  {itemCount ? 'Open cart' : 'Start checkout'}
                </Link>
              </>
            }
            className="app-menu-offer-banner"
            description={
              offersConfig.bannerDescription ||
              '₹299 = free delivery up to 5 km • ₹499 = free delivery + free mango juice'
            }
            eyebrow={offersConfig.bannerEyebrow || 'Live rewards'}
            title={itemCount ? cartOfferState.offerMessage : offersConfig.bannerTitle || 'Order smart and unlock rewards while you browse'}
            tone="accent"
          />

          <div className="app-menu-toolbar panel-card">
            <div className="app-menu-toolbar-group">
              <div>
                <p className="eyebrow">Quick chips</p>
                <h3>Fast shortcuts</h3>
              </div>
              <QuickChips activeChip={chipParam} chips={APP_QUICK_CHIPS} onSelectChip={(value) => updateFilter('chip', value)} />
            </div>

            <div className="app-menu-toolbar-group">
              <div>
                <p className="eyebrow">Categories</p>
                <h3>Jump to the right section</h3>
              </div>
              <CategoryShowcase
                activeCategory={categoryParam}
                categories={railCategories}
                onSelectCategory={(value) => updateFilter('category', value)}
              />
            </div>

            <div className="app-menu-toolbar-group">
              <div className="app-menu-filter-heading">
                <div>
                  <p className="eyebrow">Price filter</p>
                  <h3>Keep spend in range</h3>
                </div>
                <button className="btn btn-secondary app-menu-reset-button" onClick={clearFilters} type="button">
                  <Filter size={16} />
                  Reset
                </button>
              </div>
              <div className="app-filter-strip">
                {priceFilters.map((filter) => (
                  <button
                    className={`quick-chip ${priceFilter === filter.value ? 'active' : ''}`.trim()}
                    key={filter.value}
                    onClick={() => updateFilter('price', filter.value)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {search ? (
                <p className="app-menu-query-note">
                  Showing results for <strong>{search}</strong>
                </p>
              ) : null}
            </div>
          </div>

          {filteredProducts.length ? (
            <FeaturedProductsGrid
              description="Direct add-to-cart cards stay front and center so customers can order fast."
              eyebrow="Menu results"
              loading={loading}
              products={filteredProducts}
              title="Pure veg dishes ready to add"
              whatsappNumber={settings?.whatsappNumber}
            />
          ) : (
            <EmptyState
              action={
                <button className="btn btn-primary" onClick={clearFilters} type="button">
                  Clear filters
                </button>
              }
              description="Try a different search, category, or price range."
              title="No dishes match these filters"
            />
          )}

          {comboOffers.length ? (
            <section className="app-section-block">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Combo ideas</p>
                  <h2>Faster basket building</h2>
                </div>
              </div>
              <div className="app-plan-grid">
                {comboOffers.map((combo) => (
                  <article className="app-plan-card" key={combo.id}>
                    <p className="eyebrow">Combo pick</p>
                    <h3>{combo.title}</h3>
                    <p>{combo.description}</p>
                    <strong>{formatCurrency(combo.total)}</strong>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        addItemsToCart(
                          combo.items.map((item) => ({
                            ...item,
                            quantity: 1,
                          })),
                        )
                      }
                      type="button"
                    >
                      Add combo
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </PageTransition>
  );
};
