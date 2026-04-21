// context/favoritesContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Game } from '../types';

type FavoritesContextType = {
  favoritos: Game[];
  isFavorito: (titulo: string) => boolean;
  agregarAFavoritos: (game: Game) => void;
  eliminarFavorito: (titulo: string) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoritos, setFavoritos] = useState<Game[]>(() => {
    const stored = localStorage.getItem('favoritos');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  const isFavorito = (titulo: string) =>
    favoritos.some((game) => game.titulo === titulo);

  const agregarAFavoritos = (game: Game) => {
    if (!isFavorito(game.titulo)) {
      setFavoritos((prev) => [...prev, game]);
    }
  };

  const eliminarFavorito = (titulo: string) => {
    setFavoritos((prev) => prev.filter((g) => g.titulo !== titulo));
  };

  return (
    <FavoritesContext.Provider
      value={{ favoritos, isFavorito, agregarAFavoritos, eliminarFavorito }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook personalizado
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }
  return context;
};
