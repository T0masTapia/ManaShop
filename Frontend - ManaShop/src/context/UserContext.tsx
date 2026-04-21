import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

type Usuario = {
  id: number;
  nombre : string;
  apellido : string;
  email: string;
  tipo_usuario: string;
};

type UserContextType = {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
};

const UserContext = createContext<UserContextType>({
  usuario: null,
  setUsuario: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
  const token = localStorage.getItem('token');

  if (token) {
    axios.get('http://localhost:3001/perfil/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUsuario(res.data); // aquí guardas el perfil completo
    })
    .catch(() => {
      setUsuario(null);
    });
  }
}, []);


  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
