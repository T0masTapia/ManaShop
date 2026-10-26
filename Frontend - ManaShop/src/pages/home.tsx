import { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Game } from '../types';
import { Search, Sparkles, X } from 'lucide-react';
import { formatearPrecio } from '../utils/format';

const Home = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { usuario } = useUser();

  useEffect(() => {
    axios.get('http://localhost:3001/juegos')
      .then((res) => {
        const juegosAdaptados: Game[] = res.data.map((juego: any) => ({
          id: juego.id,
          titulo: juego.name,
          precio: Number(juego.price),
          descrip: juego.description,
          image: juego.image,
          stock: juego.stock,
        }));
        setGames(juegosAdaptados);
      })
      .catch((err) => console.error('Error al obtener los juegos:', err));
  }, []);

  const popularGames = games.slice(0, 4);
  const filteredGames = games.filter((game) =>
    game.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (popularGames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === popularGames.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [popularGames.length]);

  return (
    <div className="min-h-screen bg-transparent pb-20 font-sans">
      {/* Header con degradado moderno */}
      <header className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-[2.5rem] pt-14 pb-28 px-6 shadow-2xl border border-blue-900/30 overflow-hidden mb-0">
        {/* Luces de fondo decorativas */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} className="text-blue-400" />
            Catálogo ManaShop
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase italic leading-tight">
            Hola, <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent not-italic font-black">{usuario?.nombre ?? 'Tomas'}</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto font-medium mt-3">
            Explora las últimas novedades y encuentra tu próximo gran desafío digital.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-20">

        {/* Buscador Pro */}
        <section className="relative z-20 -mt-8 max-w-2xl mx-auto px-4 mb-16">
          <div className="flex items-center bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-2 focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="pl-4 pr-1 text-slate-400 flex items-center">
              <Search size={22} className="text-blue-600" />
            </div>
            <input
              type="text"
              placeholder="¿Qué juego buscas hoy? (Ej: Zelda, Mario, Elden Ring...)"
              className="w-full px-3 py-3.5 text-slate-800 placeholder-slate-400 outline-none text-base font-bold bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-xl transition-colors mr-1"
                title="Borrar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </section>

        {!searchTerm && (
          <section className="mb-20">
            <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 italic">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg not-italic">!</span>
              Novedades
            </h2>

            {/* Carrusel */}
            <div className="relative group bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="relative h-[450px] md:h-[550px]">
                {popularGames.map((game, i) => (
                  <div
                    key={game.id}
                    className={`absolute inset-0 flex flex-col md:flex-row transition-all duration-1000 ease-in-out ${i === currentIndex ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-20 z-0 pointer-events-none'
                      }`}
                  >
                    <div className="w-full md:w-[60%] h-full relative overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                    </div>

                    <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 bg-white">
                      <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2 italic underline decoration-blue-200 decoration-4">Destacado</span>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
                        {game.titulo}
                      </h3>
                      <p className="text-slate-500 text-lg mb-8 line-clamp-3 leading-relaxed">
                        {game.descrip}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-3xl font-black text-slate-900">
                          ${formatearPrecio(game.precio)}
                        </span>
                        <Link
                          to={`/juego/${game.id}`}
                          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:-translate-y-1"
                        >
                          Ver Juego
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles */}
              <button onClick={() => setCurrentIndex(prev => prev === 0 ? popularGames.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-4 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 font-bold">←</button>
              <button onClick={() => setCurrentIndex(prev => prev === popularGames.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-4 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 font-bold">→</button>
            </div>
          </section>
        )}

        {/* Listado */}
        <section>
          <div className="flex items-center justify-between mb-10 border-b border-slate-200 pb-4">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">🎮 Todo el Catálogo</h2>
            {/* <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">Mostrando {filteredGames.length} juegos</span> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;