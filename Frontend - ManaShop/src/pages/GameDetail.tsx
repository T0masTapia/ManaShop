import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/cartContext';
import { useFavorites } from '../context/favoritesContext';
import {
  ShoppingCart,
  Heart,
  HeartOff,
  ArrowLeft,
  ShieldCheck,
  Zap,
  ChevronRight,
  Loader2,
  PackageCheck,
  Ban,
  Gamepad2,
  Globe2,
  Cpu,
  Layers
} from 'lucide-react';
import { formatearPrecio } from '../utils/format';

interface Game {
  id: number;
  titulo: string;
  precio: number;
  descrip: string;
  image: string;
  stock: number;
}

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isFavorito, agregarAFavoritos, eliminarFavorito } = useFavorites();

  useEffect(() => {
    if (!id) return;

    const fetchGame = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/juegos/${id}`);
        const juego = res.data;

        setGame({
          id: juego.id,
          titulo: juego.titulo || juego.name || '',
          precio: Number(juego.precio || juego.price || 0),
          descrip: juego.descrip || juego.description || '',
          image: juego.image || '',
          stock: juego.stock || 0,
        });
      } catch (error) {
        console.error('Error fetching game:', error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-slate-400">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={44} />
        <p className="font-black text-xs uppercase tracking-[0.25em] text-slate-500">Cargando detalles...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="w-14 h-14 mx-auto mb-4 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
          <Ban size={28} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2 uppercase italic">Juego no encontrado</h2>
        <p className="text-slate-400 text-sm mb-6">El título seleccionado no existe o no está disponible.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Volver a la tienda
        </Link>
      </div>
    );
  }

  const hayStock = game.stock > 0;

  return (
    <div className="w-full px-4 md:px-8 pb-20 animate-in fade-in duration-500">

      {/* 1. BARRA SUPERIOR DE RUTA */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
        <div className="flex items-center gap-3">
          {/* <span className="text-xs font-mono font-bold text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-200">
            ID #{game.id}
          </span> */}
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${hayStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
            }`}>
            {hayStock ? `${game.stock} Disponibles` : 'Sin Stock'}
          </span>
        </div>
      </div>

      {/* 2. ENCABEZADO PRINCIPAL DEL JUEGO */}
      <div className="mb-8">
        {/* <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest mb-2">
          <Zap size={14} /> Entrega Digital Inmediata
        </div> */}
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tight leading-none">
          {game.titulo}
        </h1>
      </div>

      {/* 3. GRID PRINCIPAL (70% CONTENIDO / 30% PANEL COMPRA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* COLUMNA IZQUIERDA: VISUAL + DETALLES (8 COLS) */}
        <section className="lg:col-span-8 space-y-6">

          {/* BANNER PRINCIPAL DEL JUEGO */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl bg-slate-900 border border-slate-200">
            <img
              src={game.image}
              alt={game.titulo}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x600?text=ManaShop' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-6 text-white">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300">Licencia Oficial</span>
              <p className="text-lg font-black tracking-wide">{game.titulo}</p>
            </div>
          </div>

          {/* SINOPSIS */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-wider flex items-center gap-2">
              <Layers size={20} className="text-blue-600" />
              Descripción del Producto
            </h2>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-line">
              {game.descrip || 'Sin descripción detallada para este producto.'}
            </p>
          </div>

          {/* FICHA TÉCNICA RÁPIDA */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Gamepad2 size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Formato</span>
                <span className="text-sm font-black text-slate-800">Código Digital</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Globe2 size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Región</span>
                <span className="text-sm font-black text-slate-800">Chile / Global</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 col-span-2 sm:col-span-1">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Cpu size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Canje</span>
                <span className="text-sm font-black text-slate-800">Inmediato</span>
              </div>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: CAJA DE COMPRA (4 COLS) */}
        <aside className="lg:col-span-4 sticky top-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">

            {/* MINIATURA EN LA TARJETA */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <img
                src={game.image}
                alt=""
                className="w-16 h-20 rounded-xl object-cover shadow-md bg-slate-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">Juego Base</span>
                <p className="font-black text-slate-900 truncate text-base">{game.titulo}</p>
                <span className="text-xs text-slate-400">Entrega por e-mail</span>
              </div>
            </div>

            {/* PRECIO */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Precio Total
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  ${formatearPrecio(game.precio)}
                </span>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                  CLP
                </span>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL AÑADIR AL CARRITO */}
            {/* BOTÓN PRINCIPAL AÑADIR AL CARRITO */}
            <button
              onClick={() => addToCart(game)}
              disabled={!hayStock}
              className={`w-full py-4 px-6 !rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                hayStock
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingCart size={19} className="stroke-[2.5]" />
              <span>{hayStock ? 'Añadir al Carrito' : 'Agotado Temporalmente'}</span>
            </button>

            {/* FILA DE BOTONES SECUNDARIOS */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {!isFavorito(game.titulo) ? (
                <button
                  type="button"
                  onClick={() => agregarAFavoritos(game)}
                  className="py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 !rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Heart size={16} className="text-slate-600 flex-shrink-0" />
                  <span>Deseados</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => eliminarFavorito(game.titulo)}
                  className="py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 !rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-rose-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <HeartOff size={16} className="flex-shrink-0" />
                  <span>Guardado</span>
                </button>
              )}

              <Link
                to="/favoritos"
                className="!no-underline py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 !rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="!no-underline">Mi Lista</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* GARANTÍA */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Pago 100% seguro y encriptado</span>
              </div>
              <div className="flex items-center gap-2">
                <PackageCheck size={16} className="text-blue-500 flex-shrink-0" />
                <span>Clave digital original de proveedor</span>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default GameDetail;