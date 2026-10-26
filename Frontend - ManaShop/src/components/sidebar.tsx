import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/cartContext';
import { useUser } from '../context/UserContext';
import {
  Home, ShoppingCart, Heart, User,
  UserPlus, PlusSquare, Layers,
  ChevronLeft, ChevronRight,
  Users, // Importamos el icono para Clientes
  BarChart3
} from 'lucide-react';

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const savedSidebarState = localStorage.getItem('sidebarState');
  const [isSidebarOpen, setIsSidebarOpen] = useState(savedSidebarState === 'open');
  const { usuario } = useUser();
  const { carrito } = useCart();

  useEffect(() => {
    localStorage.setItem('sidebarState', isSidebarOpen ? 'open' : 'closed');
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-transparent">
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-900 text-white transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xl ${isSidebarOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="p-4 mb-6 flex items-center gap-3 overflow-hidden border-b border-slate-800">
          <img
            src="/images/b5e0bd77-6c65-4dad-8ad1-ed02b07ff296.png"
            alt="Logo"
            className={`transition-all duration-300 min-w-[40px] h-10 object-contain ${isSidebarOpen ? 'scale-100' : 'scale-90 mx-auto'
              }`}
          />
          {isSidebarOpen && (
            <span className="text-xl font-black tracking-tighter whitespace-nowrap bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent">
              ManaShop
            </span>
          )}
        </div>

        <nav className="!no-underline flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <NavItem to="/" icon={<Home size={22} />} label="Inicio" isOpen={isSidebarOpen} />
          <NavItem to="/carrito" icon={<ShoppingCart size={22} />} label="Carrito" isOpen={isSidebarOpen} badge={carrito.length > 0 ? carrito.length : undefined} />
          <NavItem to="/favoritos" icon={<Heart size={22} className="text-red-500 fill-red-500/20" />} label="Favoritos" isOpen={isSidebarOpen} />
          <NavItem to="/perfil" icon={<User size={22} />} label="Perfil" isOpen={isSidebarOpen} />

          {/* SECCIÓN ADMINISTRADOR */}
          {usuario?.tipo_usuario === 'admi' && (
            <NavItem to="/crear-usuario" icon={<UserPlus size={22} />} label="Usuarios" isOpen={isSidebarOpen} />
          )}

          {/* SECCIÓN EJECUTIVO */}
          {usuario?.tipo_usuario === 'ejecutivo' && (
            <>
              <NavItem to="/crear-juego" icon={<PlusSquare size={22} />} label="Juegos" isOpen={isSidebarOpen} />
              <NavItem to="/gestion-clientes" icon={<Users size={22} />} label="Clientes" isOpen={isSidebarOpen} />
              <NavItem to="/reporte-ventas" icon={<BarChart3 size={22} />} label="Ventas" isOpen={isSidebarOpen} />
              <NavItem to="/tipos" icon={<Layers size={22} />} label="Tipos" isOpen={isSidebarOpen} />
            </>
          )}

        </nav>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="m-4 p-2 bg-slate-800 hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center shadow-inner">
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </aside>

      <main
        className="flex-1 transition-all duration-300 ease-in-out w-full bg-transparent"
        style={{ paddingLeft: isSidebarOpen ? '16rem' : '5rem' }}
      >
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, isOpen, badge }: any) => {
  return (
    <NavLink to={to} end={to === "/"} className={({ isActive }) =>
      `!no-underline flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`
    }>
      <div className="relative">
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-900 animate-pulse">
            {badge}
          </span>
        )}
      </div>
      {isOpen && <span className="font-medium text-sm whitespace-nowrap transition-opacity duration-300">{label}</span>}
    </NavLink>
  );
};

export default Sidebar;