import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { CartProvider } from './context/cartContext'; 
import { FavoritesProvider } from './context/favoritesContext'; 
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <CartProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </CartProvider>
    </UserProvider>
  </React.StrictMode>
);