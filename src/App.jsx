import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { SpecialOfferPopup } from './components/layout/SpecialOfferPopup';
import { WhatsAppFab } from './components/layout/WhatsAppFab';
import { FloatingCartBar } from './components/layout/FloatingCartBar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Loader } from './components/common/Loader';
import { CartActionToast } from './components/order/CartActionToast';
import { CheckoutRecoveryPopup } from './components/order/CheckoutRecoveryPopup';
import { GoogleAnalytics } from './components/seo/GoogleAnalytics';
import { useAppData } from './contexts/AppDataContext';
import { useCart } from './contexts/CartContext';
import { clearCheckoutRecovery, readCheckoutRecovery } from './utils/cartRecovery';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then((module) => ({ default: module.MenuPage })));
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })),
);
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })),
);
const OrderSuccessPage = lazy(() =>
  import('./pages/OrderSuccessPage').then((module) => ({ default: module.OrderSuccessPage })),
);
const TrackLookupPage = lazy(() =>
  import('./pages/TrackLookupPage').then((module) => ({ default: module.TrackLookupPage })),
);
const TrackOrderPage = lazy(() =>
  import('./pages/TrackOrderPage').then((module) => ({ default: module.TrackOrderPage })),
);
const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const SubscriptionPage = lazy(() =>
  import('./pages/SubscriptionPage').then((module) => ({ default: module.SubscriptionPage })),
);
const MonthlyThaliPlanIndorePage = lazy(() =>
  import('./pages/MonthlyThaliPlanIndorePage').then((module) => ({
    default: module.MonthlyThaliPlanIndorePage,
  })),
);
const TiffinServiceIndorePage = lazy(() =>
  import('./pages/TiffinServiceIndorePage').then((module) => ({
    default: module.TiffinServiceIndorePage,
  })),
);
const PunjabiFoodRestaurantIndorePage = lazy(() =>
  import('./pages/PunjabiFoodRestaurantIndorePage').then((module) => ({
    default: module.PunjabiFoodRestaurantIndorePage,
  })),
);
const VegTiffinServiceIndorePage = lazy(() =>
  import('./pages/VegTiffinServiceIndorePage').then((module) => ({
    default: module.VegTiffinServiceIndorePage,
  })),
);
const OfficeLunchDeliveryIndorePage = lazy(() =>
  import('./pages/OfficeLunchDeliveryIndorePage').then((module) => ({
    default: module.OfficeLunchDeliveryIndorePage,
  })),
);
const DailyThaliNearSiliconRoadPage = lazy(() =>
  import('./pages/DailyThaliNearSiliconRoadPage').then((module) => ({
    default: module.DailyThaliNearSiliconRoadPage,
  })),
);
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));
const AdminIndexRedirect = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminIndexRedirect })),
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const AdminHeroPage = lazy(() =>
  import('./pages/admin/AdminHeroPage').then((module) => ({ default: module.AdminHeroPage })),
);
const AdminOffersPage = lazy(() =>
  import('./pages/admin/AdminOffersPage').then((module) => ({ default: module.AdminOffersPage })),
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((module) => ({ default: module.AdminProductsPage })),
);
const AdminPopupPage = lazy(() =>
  import('./pages/admin/AdminPopupPage').then((module) => ({ default: module.AdminPopupPage })),
);
const AdminReviewsPage = lazy(() =>
  import('./pages/admin/AdminReviewsPage').then((module) => ({ default: module.AdminReviewsPage })),
);
const AdminThemePage = lazy(() =>
  import('./pages/admin/AdminThemePage').then((module) => ({ default: module.AdminThemePage })),
);
const AdminSectionsPage = lazy(() =>
  import('./pages/admin/AdminSectionsPage').then((module) => ({ default: module.AdminSectionsPage })),
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((module) => ({ default: module.AdminOrdersPage })),
);
const AdminKitchenPage = lazy(() =>
  import('./pages/admin/AdminKitchenPage').then((module) => ({ default: module.AdminKitchenPage })),
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((module) => ({
    default: module.AdminCategoriesPage,
  })),
);
const AdminDeliveryPage = lazy(() =>
  import('./pages/admin/AdminDeliveryPage').then((module) => ({ default: module.AdminDeliveryPage })),
);
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })),
);
const DeliveryPage = lazy(() =>
  import('./pages/DeliveryPage').then((module) => ({ default: module.DeliveryPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

const CustomerLayout = () => {
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
    <div className="app-shell customer-app-shell">
      <Navbar businessName={settings?.businessName} />
      <div className="page-stack">
        <Outlet />
      </div>
      <Footer settings={settings} />
      <FloatingCartBar />
      <CartActionToast onDismiss={dismissCartToast} toast={cartToast} />
      <MobileNav />
      <SpecialOfferPopup
        config={appConfig.popup}
        enabled={location.pathname === '/' && appConfig.sections?.popup !== false}
        phoneNumber={settings?.whatsappNumber}
      />
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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<Loader message="Opening Sardar Ji Food Corner..." />}>
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/monthly-thali-plan-indore" element={<MonthlyThaliPlanIndorePage />} />
            <Route path="/tiffin-service-indore" element={<TiffinServiceIndorePage />} />
            <Route path="/punjabi-food-restaurant-indore" element={<PunjabiFoodRestaurantIndorePage />} />
            <Route path="/veg-tiffin-service-indore" element={<VegTiffinServiceIndorePage />} />
            <Route path="/office-lunch-delivery-indore" element={<OfficeLunchDeliveryIndorePage />} />
            <Route path="/daily-thali-near-silicon-road" element={<DailyThaliNearSiliconRoadPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute roles={['customer']}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success/:orderId"
              element={
                <ProtectedRoute roles={['customer']}>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route path="/track/:orderId" element={<TrackOrderPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={['customer']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-subscription"
              element={
                <ProtectedRoute roles={['customer']}>
                  <SubscriptionPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminIndexRedirect />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="hero" element={<AdminHeroPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="popup" element={<AdminPopupPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="theme" element={<AdminThemePage />} />
            <Route path="sections" element={<AdminSectionsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="kitchen" element={<AdminKitchenPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="delivery" element={<AdminDeliveryPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
          <Route
            path="/delivery"
            element={
              <ProtectedRoute roles={['delivery']}>
                <DeliveryPage />
              </ProtectedRoute>
            }
          />
          <Route path="/track" element={<TrackLookupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
