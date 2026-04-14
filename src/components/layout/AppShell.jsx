import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { TopAppBar } from './TopAppBar';
import { BottomNavigation } from './BottomNavigation';
import { SpecialOfferPopup } from './SpecialOfferPopup';
import { WebsiteDownloadPopup } from './WebsiteDownloadPopup';
import { WhatsAppFab } from './WhatsAppFab';
import { FloatingCartBar } from './FloatingCartBar';
import { CartActionToast } from '../order/CartActionToast';
import { CheckoutRecoveryPopup } from '../order/CheckoutRecoveryPopup';
import { clearCheckoutRecovery, readCheckoutRecovery } from '../../utils/cartRecovery';
import { useAppData } from '../../contexts/AppDataContext';
import { useCart } from '../../contexts/CartContext';
import { useEffect, useState } from 'react';

export const AppShell = () => {
  const { appConfig, settings } = useAppData();
  const { cartToast, dismissCartToast } = useCart();
  const location = useLocation();
  const [checkoutRecovery, setCheckoutRecovery] = useState(null);

  useEffect(() => {
    setCheckoutRecovery(readCheckoutRecovery());
  }, [location.pathname]);

  useEffect(() => {
    const syncRecovery = () => {
      setCheckoutRecovery(readCheckoutRecovery());
    };

    window.addEventListener('storage', syncRecovery);
    return () => window.removeEventListener('storage', syncRecovery);
  }, []);

  return (
    <div className="app-shell customer-app-shell app-first-shell">
      <TopAppBar />
      <div className="page-stack">
        <Outlet />
      </div>
      <Footer settings={settings} />
      <FloatingCartBar />
      <CartActionToast onDismiss={dismissCartToast} toast={cartToast} />
      <BottomNavigation />
      <SpecialOfferPopup
        config={appConfig.popup}
        enabled={location.pathname === '/' && appConfig.sections?.popup !== false}
        phoneNumber={settings?.whatsappNumber}
      />
      <WebsiteDownloadPopup />
      {location.pathname !== '/checkout' ? (
        <CheckoutRecoveryPopup
          onDismiss={() => {
            clearCheckoutRecovery();
            setCheckoutRecovery(null);
          }}
          recovery={checkoutRecovery}
        />
      ) : null}
      <WhatsAppFab phoneNumber={settings?.whatsappNumber} />
    </div>
  );
};
