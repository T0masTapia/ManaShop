import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

export type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  tipo_usuario: string;
  profile_picture?: string | null;
  foto?: string | null;
};

type UserContextType = {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  usuario: null,
  setUsuario: () => {},
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Leemos desde localStorage para que la foto no parpadee ni se borre al recargar
  const [usuario, setUsuarioState] = useState<Usuario | null>(() => {
    const sesionGuardada = localStorage.getItem('usuario');
    if (sesionGuardada) {
      try {
        return JSON.parse(sesionGuardada);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Guarda tanto en el estado de React como en localStorage
  const setUsuario = (nuevoUsuario: Usuario | null) => {
    setUsuarioState(nuevoUsuario);
    if (nuevoUsuario) {
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    } else {
      localStorage.removeItem('usuario');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    axios
      .get('http://localhost:3001/perfil/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const datos = res.data;
        // Asignamos la imagen sin importar si se llama profile_picture o foto
        const imagenUrl = datos.profile_picture || datos.foto || null;

        const usuarioMapeado: Usuario = {
          ...datos,
          profile_picture: imagenUrl,
          foto: imagenUrl,
        };

        setUsuario(usuarioMapeado);
      })
      .catch((err) => {
        console.error('Error al recuperar sesión:', err);
        setUsuario(null);
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);