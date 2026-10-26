import { Link } from 'react-router-dom';
import { useFavorites } from '../context/favoritesContext';
import { Heart, Trash2, Eye, Ghost } from 'lucide-react'; // Ghost para el estado vacío

const Favorites = () => {
  const { favoritos, eliminarFavorito } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* TÍTULO */}
      <div className="flex items-center gap-4 mb-12">
        <div className="bg-red-500 p-3 rounded-2xl shadow-lg shadow-red-200">
          <Heart className="text-white fill-white" size={28} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tus Favoritos</h2>
          <p className="text-slate-500 font-medium italic">Lista de deseos personalizada</p>
        </div>
      </div>

      {favoritos.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ghost className="text-slate-300" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Está muy vacío por aquí...</h3>
          <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">
            ¿Aún no has encontrado ese juego épico? Explora nuestra colección y guarda los que más te gusten.
          </p>
          <Link
            to="/"
            className="inline-block bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            Explorar Juegos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favoritos.map((game) => (
            <div
              key={game.titulo}
              className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col h-full"
            >
              {/* IMAGEN CON OVERLAY */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={game.image}
                  alt={game.titulo}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  type="button"
                  onClick={() => eliminarFavorito(game.titulo)}
                  className="absolute top-3.5 right-3.5 z-20 px-3 py-2 bg-slate-950/85 hover:bg-rose-600 text-slate-300 hover:text-white !rounded-2xl backdrop-blur-md border border-slate-800 hover:border-rose-500 shadow-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 group"
                  title="Eliminar de favoritos"
                >
                  <Trash2 size={15} className="text-rose-400 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden group-hover:inline-block transition-all">
                    Quitar
                  </span>
                </button>
              </div>

              {/* CONTENIDO */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-black text-slate-900 text-xl leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                  {game.titulo}
                </h3>

                <div className="flex flex-col mt-auto pt-4 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Precio actual</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">
                      ${game.precio.toLocaleString('es-CL')}
                    </span>

                    <Link
                      to={`/juego/${game.id}`}
                      className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-90"
                      title="Ver detalles"
                    >
                      <Eye size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;