import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, MessageCircleMore, Minus, Plus, Share2, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { EmptyState } from '../components/common/EmptyState';
import { SmartImage } from '../components/common/SmartImage';
import { FrequentlyBoughtTogether } from '../components/menu/FrequentlyBoughtTogether';
import { ProductCard } from '../components/menu/ProductCard';
import { SeoMeta } from '../components/seo/SeoMeta';
import { useAppData } from '../contexts/AppDataContext';
import { useCart } from '../contexts/CartContext';
import { getFallbackImage } from '../data/fallbackImages';
import {
  BUTTON_PRESS_VARIANTS,
  CARD_IMAGE_VARIANTS,
  CONTENT_FADE_VARIANTS,
  CONTENT_STACK_VARIANTS,
  QUANTITY_SWAP_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  SURFACE_REVEAL_VARIANTS,
} from '../motion/variants';
import { formatCurrency } from '../utils/format';
import { createProductOrderMessage, createWhatsAppLink } from '../utils/whatsapp';
import { createBreadcrumbSchema } from '../seo/siteSeo';
import { trackWhatsAppClick } from '../utils/analytics';
import { shareNativeContent, triggerNativeHaptic } from '../lib/nativeFeatures';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, settings } = useAppData();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const product = products.find((entry) => entry.id === id);
  const quantity = getItemQuantity(id);

  if (!product) {
    return (
      <PageTransition>
        <SeoMeta noIndex path={`/product/${id || ''}`} title="Product Not Found" />
        <section className="section first-section">
          <div className="container">
            <EmptyState title="Product not found" description="This menu item may have been removed or is unavailable right now." />
          </div>
        </section>
      </PageTransition>
    );
  }

  const suggestions = products
    .filter((entry) => entry.category === product.category && entry.id !== product.id)
    .slice(0, 3);
  const frequentlyBoughtItems = products
    .filter((entry) => entry.id !== product.id && entry.isAvailable)
    .sort((left, right) => {
      const leftScore = Number(left.category === product.category) + Number(/lassi|chaach|beverage/i.test(left.category));
      const rightScore = Number(right.category === product.category) + Number(/lassi|chaach|beverage/i.test(right.category));
      return rightScore - leftScore;
    })
    .slice(0, 2);

  const handleShareProduct = async () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const shared = await shareNativeContent({
      title: product.name,
      text: `Check out ${product.name} from Sardar Ji Food Corner for ${formatCurrency(product.price)}.`,
      url: productUrl,
    });

    if (shared) {
      void triggerNativeHaptic('light');
    }
  };

  return (
    <PageTransition>
      <SeoMeta
        description={`${product.name} from Sardar Ji Food Corner. Pure veg food delivery in Indore with fresh daily ordering and quick checkout.`}
        includeLocalBusiness
        keywords={[
          `${product.name} Indore`,
          `${product.category} in Indore`,
          'pure veg food delivery Indore',
        ]}
        path={`/product/${product.id}`}
        schema={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Menu', path: '/menu' },
          { name: product.name, path: `/product/${product.id}` },
        ])}
        settings={settings}
        title={`${product.name} in Indore`}
      />
      <section className="section first-section">
        <div className="container">
          <motion.div
            animate="show"
            className="detail-grid detail-grid-premium"
            initial="hidden"
            variants={CONTENT_STACK_VARIANTS}
          >
            <motion.div className="detail-media detail-media-card" variants={SURFACE_REVEAL_VARIANTS}>
              <motion.div className="detail-media-shell" initial="rest" variants={CARD_IMAGE_VARIANTS} whileHover="hover">
                <SmartImage
                  alt={`${product.name} home style thali and veg food in Indore`}
                  className="detail-media-image"
                  fallbackSrc={getFallbackImage(product.category)}
                  sizes="(max-width: 768px) 100vw, 52vw"
                  src={product.image}
                />
              </motion.div>
              <div className="detail-media-topbar">
                <span className="hero-chip">{product.category}</span>
                <span className="hero-chip">{product.badge || 'Fresh daily'}</span>
              </div>
              <div className="detail-media-overlay-card">
                <p className="eyebrow">House favourite</p>
                <h3>{product.name}</h3>
                <p>Pure veg comfort food from Sardar Ji Food Corner, packed fresh for fast delivery in Indore.</p>
              </div>
            </motion.div>

            <motion.div className="detail-copy detail-copy-card" variants={SURFACE_REVEAL_VARIANTS}>
              <motion.div className="detail-copy-stack" variants={CONTENT_STACK_VARIANTS}>
                <motion.div className="detail-heading-block" variants={CONTENT_FADE_VARIANTS}>
                  <span className="hero-chip">{product.category}</span>
                  <h1>{product.name}</h1>
                  <p className="detail-price">{formatCurrency(product.price)}</p>
                  <p>{product.description}</p>
                </motion.div>

                <motion.div className="detail-list detail-list-premium" variants={CONTENT_FADE_VARIANTS}>
                  <span>
                    <BadgeCheck size={16} />
                    {product.badge || 'Fresh daily'}
                  </span>
                  <span>
                    <BadgeCheck size={16} />
                    {product.isAvailable ? 'Available now' : 'Currently unavailable'}
                  </span>
                  <span>
                    <BadgeCheck size={16} />
                    Best enjoyed hot and fresh
                  </span>
                </motion.div>

                <motion.div className="detail-support-card" variants={CONTENT_FADE_VARIANTS}>
                  <strong>Quick order support</strong>
                  <p>Add it instantly to cart or jump to WhatsApp if you want manual confirmation from the team.</p>
                </motion.div>

                <motion.div className="hero-actions detail-actions" variants={CONTENT_FADE_VARIANTS}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {quantity > 0 ? (
                      <motion.div
                        animate="animate"
                        className="qty-control product-qty-control detail-qty-control"
                        exit="exit"
                        initial="initial"
                        key="qty"
                        layout
                        variants={QUANTITY_SWAP_VARIANTS}
                      >
                        <motion.button
                          animate="rest"
                          initial="rest"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          type="button"
                          variants={BUTTON_PRESS_VARIANTS}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Minus size={16} />
                        </motion.button>
                        <span className="product-qty-value">Qty {quantity}</span>
                        <motion.button
                          animate="rest"
                          initial="rest"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          type="button"
                          variants={BUTTON_PRESS_VARIANTS}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Plus size={16} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.button
                        animate="animate"
                        className="btn btn-primary"
                        exit="exit"
                        initial="initial"
                        key="add"
                        layout
                        onClick={() => addToCart(product)}
                        type="button"
                        variants={QUANTITY_SWAP_VARIANTS}
                        whileTap={{ scale: 0.96 }}
                      >
                        <ShoppingBag size={16} />
                        Add to cart
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <motion.a
                    animate="rest"
                    className="btn btn-secondary"
                    href={createWhatsAppLink(
                      settings?.whatsappNumber,
                      createProductOrderMessage(product.name, product.price),
                    )}
                    initial="rest"
                    onClick={() =>
                      trackWhatsAppClick({
                        source: 'product-detail',
                        label: product.name,
                        value: product.price,
                      })
                    }
                    rel="noreferrer"
                    target="_blank"
                    variants={BUTTON_PRESS_VARIANTS}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <MessageCircleMore size={16} />
                    Order on WhatsApp
                  </motion.a>
                  <motion.button
                    animate="rest"
                    className="btn btn-secondary"
                    initial="rest"
                    onClick={handleShareProduct}
                    type="button"
                    variants={BUTTON_PRESS_VARIANTS}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Share2 size={16} />
                    Share
                  </motion.button>
                </motion.div>

                <motion.div variants={CONTENT_FADE_VARIANTS}>
                  <Link className="text-link" to="/menu">
                    Back to menu
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>

                <motion.div variants={CONTENT_FADE_VARIANTS}>
                  <FrequentlyBoughtTogether items={frequentlyBoughtItems} />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {suggestions.length ? (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Suggested next</p>
                <h2>More from {product.category}</h2>
              </div>
            </div>
            <motion.div
              animate="show"
              className="grid cards-grid"
              initial="hidden"
              variants={STAGGER_CONTAINER_VARIANTS}
            >
              {suggestions.map((item, index) => (
                <ProductCard
                  key={item.id}
                  motionIndex={index}
                  product={item}
                  whatsappNumber={settings?.whatsappNumber}
                />
              ))}
            </motion.div>
          </div>
        </section>
      ) : null}
    </PageTransition>
  );
};
