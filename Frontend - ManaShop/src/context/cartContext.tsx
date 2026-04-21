import { createContext, useState, type ReactNode, useContext } from 'react';
import type { Game, GameInCart } from '../types/index';

type CartContextType = {
  carrito: GameInCart[];
  addToCart: (game: Game) => void;
  removeFromCart: (game: Game) => void;
  clearCart: () => void;
  updateStockAfterPurchase: () => void;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<GameInCart[]>([]);
  const [inventario, setInventario] = useState<Game[]>([]); // opcional, para stock simulado

  const addToCart = (game: Game) => {
    setCarrito(prev => {
      const index = prev.findIndex(item => item.id === game.id);
      if (index !== -1) {
        const updated = [...prev];
        if (updated[index].quantity < game.stock) {
          updated[index].quantity += 1;
        }
        return updated;
      } else {
        return [...prev, { ...game, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (game: Game) => {
    setCarrito(prev => prev.filter(item => item.id !== game.id));
  };

  const clearCart = () => {
    setCarrito([]);
  };

  const updateStockAfterPurchase = () => {
    setInventario(prev =>
      prev.map(item => {
        const itemInCart = carrito.find(cartItem => cartItem.id === item.id);
        if (itemInCart) {
          return {
            ...item,
            stock: Math.max(item.stock - itemInCart.quantity, 0),
          };
        }
        return item;
      })
    );
  };

  const checkout = async () => {
    if (carrito.length !== 1) {
      alert('Solo puedes comprar un juego a la vez.');
      return;
    }

    const item = carrito[0];

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/perfil/compras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          juego_id: item.id,
          precio_unitario: item.precio, // asegúrate de que el campo exista
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      alert('Compra realizada con éxito');
      clearCart();
    } catch (error) {
      console.error('Error en el checkout:', error);
      alert('Ocurrió un error al intentar comprar.');
    }
  };



  return (
    <CartContext.Provider
      value={{
        carrito,
        addToCart,
        removeFromCart,
        clearCart,
        updateStockAfterPurchase,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
