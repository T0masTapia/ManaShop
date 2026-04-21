import type { Game } from '../types';
import { useCart } from '../context/cartContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react'; // Usamos Lucide para mantener la estética

type Props = {
  game: Game;
};

const GameCard = ({ game }: Props) => {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col h-full">
      
      {/* CONTENEDOR DE IMAGEN */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link to={`/juego/${game.id}`}>
          <img
            src={game.image}
            alt={game.titulo}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay que aparece al hacer hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <div className="bg-white/90 p-3 rounded-full text-slate-900 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye size={20} />
            </div>
          </div>
        </Link>
        
        {/* Badge de Stock (Opcional) */}
        {game.stock < 5 && game.stock > 0 && (
          <span className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
            ¡Últimas {game.stock}!
          </span>
        )}
      </div>

      {/* CUERPO DE LA TARJETA */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors truncate">
            {game.titulo}
          </h3>
        </div>

        <p className="text-slate-500 text-sm line-clamp-2 italic mb-4 flex-1">
          "{game.descrip}"
        </p>

        {/* PRECIO Y ACCIÓN */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Precio</span>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              ${game.precio.toLocaleString('es-CL')}
            </span>
          </div>

          <button
            onClick={() => addToCart(game)}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-90 group/btn relative overflow-hidden"
            title="Añadir al carrito"
          >
            <ShoppingCart size={20} className="relative z-10" />
            <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;