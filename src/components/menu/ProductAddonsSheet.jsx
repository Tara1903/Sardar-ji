import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SmartImage } from '../common/SmartImage';
import { getFallbackImage } from '../../data/fallbackImages';
import { formatCurrency } from '../../utils/format';
import {
  BUTTON_PRESS_VARIANTS,
  SPRING_FAST,
} from '../../motion/variants';

const SHEET_PANEL_VARIANTS = {
  hidden: {
    opacity: 0,
    y: '100%',
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    scale: 0.985,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
};

const SHEET_BACKDROP_VARIANTS = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      duration: 0.24,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
};

const getFocusableElements = (container) =>
  Array.from(
    container?.querySelectorAll?.(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) || [],
  ).filter((element) => !element.hasAttribute('disabled'));

export const ProductAddonsSheet = ({
  onClose,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onSubmit,
  onToggleOption,
  open,
  product,
  quantity,
  requiredComplete,
  selectedAddons,
  selectedAddonsLabel,
  totalPrice,
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(panelRef.current);
      focusable[0]?.focus();
    }, 40);

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(panelRef.current);

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [onClose, open]);

  const content = useMemo(
    () => (
      <AnimatePresence>
        {open && product ? (
          <div aria-live="polite" className="addon-sheet-root">
            <motion.button
              aria-label="Close add-on selector"
              className="addon-sheet-backdrop"
              initial="hidden"
              onClick={onClose}
              type="button"
              variants={SHEET_BACKDROP_VARIANTS}
              animate="show"
              exit="exit"
            />
            <motion.section
              animate="show"
              aria-labelledby="addon-sheet-title"
              aria-modal="true"
              className="addon-sheet-panel"
              exit="exit"
              initial="hidden"
              ref={panelRef}
              role="dialog"
              variants={SHEET_PANEL_VARIANTS}
            >
              <div className="addon-sheet-grabber" />
              <div className="addon-sheet-header">
                <div className="addon-sheet-media">
                  <div className="addon-sheet-media-blur" />
                  <SmartImage
                    alt={product.name}
                    className="addon-sheet-image"
                    fallbackSrc={getFallbackImage(product.category)}
                    sizes="(max-width: 768px) 100vw, 240px"
                    src={product.image}
                  />
                </div>
                <div className="addon-sheet-copy">
                  <div className="space-between">
                    <div>
                      <p className="eyebrow">{product.category}</p>
                      <h2 id="addon-sheet-title">{product.name}</h2>
                    </div>
                    <button
                      aria-label="Close add-on selector"
                      className="icon-btn addon-sheet-close"
                      onClick={onClose}
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="addon-sheet-base-price">
                    Base price <strong>{formatCurrency(product.price)}</strong>
                  </p>
                  <p>{product.description}</p>
                </div>
              </div>

              <div className="addon-sheet-scroll">
                {(product.addonGroups || []).map((group) => {
                  const selectedForGroup = selectedAddons?.[group.id] || [];

                  return (
                    <section className="addon-sheet-group" key={group.id}>
                      <div className="space-between addon-sheet-group-header">
                        <div>
                          <h3>{group.title}</h3>
                          <p>
                            {group.selectionType === 'single'
                              ? 'Choose one option'
                              : `Choose up to ${group.maxSelections}`}
                          </p>
                        </div>
                        {group.required ? <span className="addon-required-pill">Required</span> : null}
                      </div>

                      <div className="addon-option-list">
                        {group.options.map((option) => {
                          const isSelected = selectedForGroup.includes(option.id);

                          return (
                            <motion.button
                              className={`addon-option-card ${isSelected ? 'active' : ''}`.trim()}
                              key={option.id}
                              onClick={() => onToggleOption(group, option)}
                              type="button"
                              whileTap={{ scale: 0.96 }}
                              transition={SPRING_FAST}
                            >
                              <div className="addon-option-copy">
                                <strong>{option.name}</strong>
                                <span>{option.price > 0 ? `+${formatCurrency(option.price)}` : 'Included'}</span>
                              </div>
                              <span
                                className={`addon-option-indicator ${
                                  group.selectionType === 'single' ? 'is-radio' : 'is-checkbox'
                                } ${isSelected ? 'active' : ''}`.trim()}
                              >
                                <Check size={14} />
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="addon-sheet-footer">
                <div className="addon-sheet-footer-meta">
                  <div className="qty-control addon-sheet-qty-control">
                    <motion.button
                      initial="rest"
                      onClick={onDecreaseQuantity}
                      type="button"
                      variants={BUTTON_PRESS_VARIANTS}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Minus size={16} />
                    </motion.button>
                    <span>{quantity}</span>
                    <motion.button
                      initial="rest"
                      onClick={onIncreaseQuantity}
                      type="button"
                      variants={BUTTON_PRESS_VARIANTS}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>

                  <div className="addon-sheet-total">
                    <span>Total price</span>
                    <AnimatePresence mode="wait">
                      <motion.strong
                        animate={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0.4, scale: 0.96 }}
                        key={totalPrice}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                      >
                        {formatCurrency(totalPrice)}
                      </motion.strong>
                    </AnimatePresence>
                    {selectedAddonsLabel ? <p>{selectedAddonsLabel}</p> : null}
                  </div>
                </div>

                <motion.button
                  className="btn btn-primary addon-sheet-submit"
                  disabled={!requiredComplete}
                  initial="rest"
                  onClick={onSubmit}
                  type="button"
                  variants={BUTTON_PRESS_VARIANTS}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {requiredComplete ? 'Add to cart' : 'Select required add-ons'}
                </motion.button>
              </div>
            </motion.section>
          </div>
        ) : null}
      </AnimatePresence>
    ),
    [
      onClose,
      onDecreaseQuantity,
      onIncreaseQuantity,
      onSubmit,
      onToggleOption,
      open,
      product,
      quantity,
      requiredComplete,
      selectedAddons,
      selectedAddonsLabel,
      totalPrice,
    ],
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(content, document.body);
};
