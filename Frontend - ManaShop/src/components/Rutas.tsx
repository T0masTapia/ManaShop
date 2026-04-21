import { Routes, Route } from 'react-router-dom';
import Home from '../pages/home';
import Carrito from '../pages/cart';
import GameDetail from '../pages/GameDetail';
import Favoritos from '../pages/Favorites';
import PerfilU from '../pages/PerfilU';
import Login from '../pages/login';
import CrearU from '../pages/CrearUsuario';
import TipoJ from '../pages/Tipos';
import CrearJuego from '../pages/CrearJuegos'; 
import GestionClientes from '../pages/GestionClientes';
import ReporteVentas from '../pages/ReporteVentas';

export default function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/juego/:id" element={<GameDetail />} />
      <Route path="/favoritos" element={<Favoritos />} />
      <Route path="/perfil" element={<PerfilU />} />
      <Route path="/login" element={<Login />} />
      <Route path='/crear-usuario' element={<CrearU/>} />
      <Route path='/tipos' element={<TipoJ/>} />
      <Route path="/crear-juego" element={<CrearJuego />} />
      <Route path="/gestion-clientes" element={<GestionClientes />} />
      <Route path="/reporte-ventas" element={<ReporteVentas />} />
    </Routes>
  );
}