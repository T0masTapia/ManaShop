import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import {
  PlusCircle,
  Edit3,
  Trash2,
  Gamepad2,
  DollarSign,
  Package,
  Image as ImageIcon,
  Type,
  Layers,
  Save,
  RefreshCw,
  AlertCircle,
  Search,
  Loader2,
  Sparkles
} from 'lucide-react';
import { formatearPrecio } from '../utils/format';

interface Juego {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  tipo_id: number;
}

interface Categoria {
  id: number;
  category: string;
}

interface SugerenciaRAWG {
  rawg_id: number;
  name: string;
  image: string;
  genres: string;
  released: string;
  rating: number;
}

const CrearJuego = () => {
  const { usuario } = useUser();
  const token = localStorage.getItem('token');

  if (usuario?.tipo_usuario !== 'ejecutivo') {
    return <Navigate to="/" />;
  }

  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para búsqueda asistida RAWG
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<SugerenciaRAWG[]>([]);
  const [buscandoRawg, setBuscandoRawg] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    tipo_id: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resJuegos, resTipos] = await Promise.all([
        axios.get('http://localhost:3001/juegos'),
        axios.get('http://localhost:3001/tipos')
      ]);
      setJuegos(resJuegos.data);
      setCategorias(resTipos.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Buscar títulos en RAWG a través del backend
  const handleBuscarRawg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminoBusqueda.trim()) return;

    setBuscandoRawg(true);
    try {
      const res = await axios.get(`http://localhost:3001/juegos/buscar-externo?q=${encodeURIComponent(terminoBusqueda)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSugerencias(res.data);
    } catch (err) {
      console.error('Error al buscar en RAWG:', err);
      alert('No se pudo consultar el catálogo externo');
    } finally {
      setBuscandoRawg(false);
    }
  };

  // Autocompletar el formulario al hacer clic en un resultado
  const handleSeleccionarSugerencia = (item: SugerenciaRAWG) => {
    setForm(prev => ({
      ...prev,
      name: item.name,
      image: item.image,
      description: `Lanzamiento: ${item.released}. Calificación: ${item.rating}/5. Géneros: ${item.genres}.`
    }));
    setSugerencias([]);
    setTerminoBusqueda('');
  };

  const handleActualizarStock = async (id: number, nombre: string, stockActual: number) => {
    const nuevoStockStr = window.prompt(`Actualizar stock para "${nombre}":`, stockActual.toString());
    if (nuevoStockStr !== null) {
      const nuevoStock = parseInt(nuevoStockStr);
      if (isNaN(nuevoStock) || nuevoStock < 0) {
        return alert("Por favor ingresa un número válido mayor o igual a 0");
      }
      try {
        await axios.patch(`http://localhost:3001/juegos/${id}/stock`, 
          { nuevoStock }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
      } catch (err) {
        alert("Error al actualizar el stock");
      }
    }
  };

  const prepararEdicion = (juego: Juego) => {
    setIsEditing(true);
    setSelectedId(juego.id);
    setForm({
      name: juego.name,
      price: juego.price.toString(),
      stock: juego.stock.toString(),
      description: juego.description,
      image: juego.image,
      tipo_id: juego.tipo_id.toString()
    });
    setSugerencias([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({ name: '', price: '', stock: '', description: '', image: '', tipo_id: '' });
    setSugerencias([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const juegoData = {
      name: form.name,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      description: form.description,
      image: form.image,
      tipo_id: parseInt(form.tipo_id)
    };
    try {
      if (isEditing && selectedId) {
        await axios.put(`http://localhost:3001/juegos/${selectedId}`, juegoData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('¡Juego actualizado!');
      } else {
        await axios.post('http://localhost:3001/juegos', juegoData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('¡Juego creado!');
      }
      cancelarEdicion();
      fetchData();
    } catch (err) {
      alert('Error en la operación');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este juego permanentemente?')) return;
    try {
      await axios.delete(`http://localhost:3001/juegos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="w-full px-4 md:px-10 pb-20 animate-in fade-in duration-700">

      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-3xl shadow-2xl transition-all duration-500 ${isEditing ? 'bg-amber-500 rotate-12' : 'bg-slate-900'}`}>
            <Gamepad2 className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              {isEditing ? 'Editar Juego' : 'Inventario Maestro'}
            </h2>
            <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Gestión Global del Catálogo ManaShop</p>
          </div>
        </div>
        
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 bg-white border border-slate-100 px-8 py-4 rounded-2xl font-black text-xs uppercase text-slate-500 hover:bg-slate-50 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refrescar Base de Datos
        </button>
      </div>

      {/* GRID SISTEMA */}
      <div className="grid grid-cols-1 xl:grid-cols-16 gap-8">

        {/* COLUMNA FORMULARIO (Ocupa 5 de 16) */}
        <section className="xl:col-span-5 space-y-6">
          
          {/* BUSCADOR ASISTIDO RAWG */}
          {!isEditing && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-[2.5rem] text-white shadow-xl">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2 mb-2">
                <Sparkles size={14} /> Asistente RAWG
              </h4>
              <p className="text-[11px] text-slate-300 font-semibold mb-3">
                Busca un título oficial para autocompletar portada y detalles.
              </p>

              <form onSubmit={handleBuscarRawg} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    placeholder="Ej: Elden Ring..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white placeholder-slate-400 outline-none focus:bg-white/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={buscandoRawg}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {buscandoRawg ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Buscar
                </button>
              </form>

              {/* LISTA DE SUGERENCIAS */}
              {sugerencias.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {sugerencias.map((item) => (
                    <div
                      key={item.rawg_id}
                      onClick={() => handleSeleccionarSugerencia(item)}
                      className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl cursor-pointer transition-all flex items-center gap-2.5"
                    >
                      <img
                        src={item.image || 'https://via.placeholder.com/80?text=No+Img'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <span className="text-[9px] font-black uppercase text-emerald-400">Autocompletar</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FORMULARIO DE REGISTRO / EDICIÓN */}
          <div className={`bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border-2 transition-all duration-500 ${isEditing ? 'border-amber-400 scale-[1.01]' : 'border-slate-50'}`}>
            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter flex items-center gap-3">
              {isEditing ? <Edit3 className="text-amber-500" /> : <PlusCircle className="text-indigo-600" />}
              {isEditing ? 'Modificar Registro' : 'Añadir nuevo Producto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Título del Juego</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input name="name" value={form.name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Precio ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Stock Inicial</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" required />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">URL Portada</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input name="image" value={form.image} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs" placeholder="https://..." required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Categoría</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select name="tipo_id" value={form.tipo_id} onChange={handleChange} className="w-full pl-12 pr-10 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold appearance-none cursor-pointer" required>
                    <option value="">Elegir Tipo...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.category}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-5 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-bold text-sm" placeholder="Escribe aquí los detalles del juego..." required />
              </div>

              <button type="submit" className={`w-full py-4 !rounded-[20px] font-black text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 cursor-pointer ${isEditing ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-slate-900 hover:bg-indigo-600 shadow-slate-200'}`}>
                {isEditing ? <Save size={20} /> : <PlusCircle size={20} />}
                {isEditing ? 'ACTUALIZAR REGISTRO' : 'PUBLICAR EN TIENDA'}
              </button>
              
              {isEditing && (
                <button type="button" onClick={cancelarEdicion} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer">
                  Cancelar Operación
                </button>
              )}
            </form>
          </div>
        </section>

        {/* TABLA DE INVENTARIO (Ocupa 11 de 16) */}
        <section className="xl:col-span-11">
          <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-[0.3em]">
                    <th className="px-8 py-8 font-black">Portada y Detalles</th>
                    <th className="px-8 py-8 font-black">Precio Unitario</th>
                    <th className="px-8 py-8 font-black">Disponibilidad (Ajuste Rápido)</th>
                    <th className="px-8 py-8 font-black text-center">Gestión de Datos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {juegos.map(j => (
                    <tr key={j.id} className="group hover:bg-slate-50/70 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-8">
                          <div className="relative flex-shrink-0">
                            <div className="w-28 h-36 rounded-2xl overflow-hidden shadow-2xl bg-slate-200 border-2 border-white transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                              <img 
                                src={j.image} 
                                alt={j.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x200?text=No+Cover' }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <span className="font-black text-slate-900 text-2xl tracking-tighter uppercase italic leading-tight group-hover:text-indigo-600 transition-colors">
                              {j.name}
                            </span>
                            <div className="flex gap-2">
                              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">SKU: MANA-{j.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Valor Venta</span>
                          <span className="font-black text-slate-900 text-3xl tracking-tighter">${formatearPrecio(j.price)}</span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Estado de Stock</span>
                          <button 
                            onClick={() => handleActualizarStock(j.id, j.name, j.stock)}
                            className={`w-fit px-6 py-3 !rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-3 cursor-pointer ${
                              j.stock > 5 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white hover:shadow-emerald-200' 
                                : 'bg-red-50 text-red-600 border border-red-100 animate-pulse hover:bg-red-500 hover:text-white hover:shadow-red-200'
                            }`}
                          >
                            {j.stock <= 5 && <AlertCircle size={14} />}
                            {j.stock} EN ALMACÉN
                          </button>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-4">
                          <button 
                            onClick={() => prepararEdicion(j)} 
                            className="p-4 bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white !rounded-[20px] transition-all border border-slate-100 shadow-lg hover:-translate-y-1 cursor-pointer"
                            title="Editar Juego"
                          >
                            <Edit3 size={24} />
                          </button>
                          <button 
                            onClick={() => handleEliminar(j.id)} 
                            className="p-4 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white !rounded-[20px] transition-all border border-slate-100 shadow-lg hover:-translate-y-1 cursor-pointer"
                            title="Eliminar del catálogo"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {juegos.length === 0 && (
                <div className="py-32 text-center">
                  <Package size={64} className="mx-auto text-slate-100 mb-4" />
                  <p className="font-black text-slate-300 uppercase tracking-widest">Base de datos de inventario vacía</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CrearJuego;