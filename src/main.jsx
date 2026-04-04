import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AppDataProvider } from './contexts/AppDataContext';
import { initializeNativeAppShell } from './lib/nativeApp';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppDataProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AppDataProvider>
    </AuthProvider>
  </React.StrictMode>,
);

initializeNativeAppShell();
