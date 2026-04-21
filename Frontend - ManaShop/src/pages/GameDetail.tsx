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
  Loader2
} from 'lucide-react';

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-medium animate-pulse">Cargando detalles del juego...</p>
    </div>
  );

  if (!game) return (
    <div className="max-w-xl mx-auto mt-20 text-center p-10 bg-white rounded-[2.5rem] shadow-xl">
      <h2 className="text-2xl font-black text-slate-900 mb-4">¡Ups! Juego no encontrado</h2>
      <Link to="/" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
        <ArrowLeft size={20} /> Volver a la tienda
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* BOTÓN VOLVER */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-bold transition-colors group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Volver al catálogo
      </Link>

      <div className="bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-800/50">
        <div className="flex flex-col lg:flex-row">
          
          {/* COLUMNA IZQUIERDA: IMAGEN */}
          <div className="lg:w-1/2 relative group">
            <img
              src={game.image}
              alt={game.titulo}
              className="w-full h-full object-cover min-h-[400px] lg:min-h-[600px] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            {/* Badge de Stock */}
            <div className="absolute bottom-8 left-8 flex gap-2">
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest backdrop-blur-md ${
                game.stock > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {game.stock > 0 ? `Stock: ${game.stock} unidades` : 'Agotado'}
              </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: INFO */}
          <div className="lg:w-1/2 p-8 md:p-16 flex flex-col justify-center text-white">
            <div className="flex items-center gap-2 text-blue-400 mb-4 font-black text-xs uppercase tracking-[0.3em]">
              <Zap size={14} fill="currentColor" />
              Entrega Inmediata
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
              {game.titulo}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tighter">
                ${game.precio.toLocaleString('es-CL')}
              </span>
              <div className="h-10 w-px bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Precio Final</span>
                <span className="text-xs text-slate-400 font-medium italic">Incluye impuestos</span>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Descripción</h3>
              <p className="text-slate-300 text-lg leading-relaxed italic">
                "{game.descrip}"
              </p>
            </div>

            {/* BOTONERA ACCIONES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => addToCart(game)}
                className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95 group"
              >
                <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
                Añadir al Carrito
              </button>

              {!isFavorito(game.titulo) ? (
                <button
                  onClick={() => agregarAFavoritos(game)}
                  className="bg-slate-900 border border-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Heart size={20} /> Guardar
                </button>
              ) : (
                <button
                  onClick={() => eliminarFavorito(game.titulo)}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <HeartOff size={20} /> Quitar
                </button>
              )}

              <Link 
                to="/favoritos" 
                className="bg-slate-900 border border-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Ver Lista <ChevronRight size={18} />
              </Link>
            </div>

            {/* Garantía */}
            <div className="mt-12 flex items-center gap-3 text-slate-500 text-sm border-t border-slate-900 pt-8">
              <ShieldCheck size={20} className="text-emerald-500/50" />
              <span>Compra 100% segura. Código verificado por <strong>ManaShop</strong>.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameDetail;