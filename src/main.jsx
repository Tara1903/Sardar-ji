import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AppDataProvider } from './contexts/AppDataContext';

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
