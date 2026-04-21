import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  ShoppingBag, 
  Calendar, 
  Mail, 
  ChevronRight, 
  Search, 
  Phone, 
  MapPin,
  PackageCheck
} from 'lucide-react';

interface Cliente {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  fono: string;
  direccion: string;
}

interface Compra {
  compra_id: number;
  fecha_compra: string;
  precio_unitario: string;
  nombre_juego: string;
  imagen_juego: string;
  reembolsado: number;
}

const GestionClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // 1. Cargar lista de clientes al inicio (Maestro)
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get('http://localhost:3001/usuarios/clientes-perfiles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientes(res.data);
      } catch (err) {
        console.error("Error al cargar clientes", err);
      }
    };
    fetchClientes();
  }, [token]);

  // 2. Cargar compras cuando cambia el cliente (Detalle)
  useEffect(() => {
    if (clienteSeleccionado) {
      const fetchCompras = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`http://localhost:3001/usuarios/${clienteSeleccionado.id}/compras`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCompras(res.data);
        } catch (err) {
          setCompras([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCompras();
    }
  }, [clienteSeleccionado, token]);

  const filtrados = clientes.filter(c => 
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 h-[88vh] flex flex-col animate-in fade-in duration-500">
      
      <header className="mb-8">
        <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Gestión de Clientes</h2>
        <p className="text-slate-500 font-bold">Visualiza perfiles e historial de compras de ManaShop</p>
      </header>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        
        {/* PANEL MAESTRO (IZQUIERDA) */}
        <aside className="col-span-4 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                placeholder="Buscar por nombre o email..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all text-sm"
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filtrados.map(cliente => (
              <button
                key={cliente.id}
                onClick={() => setClienteSeleccionado(cliente)}
                className={`w-full p-5 rounded-[2rem] flex items-center justify-between transition-all group ${
                  clienteSeleccionado?.id === cliente.id 
                  ? 'bg-slate-900 text-white shadow-2xl' 
                  : 'hover:bg-indigo-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${clienteSeleccionado?.id === cliente.id ? 'bg-indigo-500' : 'bg-slate-100'}`}>
                    <User size={20} className={clienteSeleccionado?.id === cliente.id ? 'text-white' : 'text-slate-400'} />
                  </div>
                  <div className="text-left">
                    <p className="font-black leading-tight text-sm uppercase tracking-tight">{cliente.nombre} {cliente.apellido}</p>
                    <p className={`text-[10px] font-bold mt-1 ${clienteSeleccionado?.id === cliente.id ? 'text-slate-400' : 'text-slate-400'}`}>
                      {cliente.email}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className={`transition-transform ${clienteSeleccionado?.id === cliente.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
              </button>
            ))}
          </div>
        </aside>

        {/* PANEL DETALLE (DERECHA) */}
        <main className="col-span-8 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-y-auto custom-scrollbar relative">
          {clienteSeleccionado ? (
            <div className="p-12">
              
              {/* Info Cliente */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div className="space-y-4">
                  <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    Perfil de Cliente
                  </span>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                    {clienteSeleccionado.nombre} <br/> {clienteSeleccionado.apellido}
                  </h3>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                      <Mail size={16} className="text-indigo-500" /> {clienteSeleccionado.email}
                    </span>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                      <Phone size={16} className="text-indigo-500" /> {clienteSeleccionado.fono}
                    </span>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                      <MapPin size={16} className="text-indigo-500" /> {clienteSeleccionado.direccion}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 mb-10" />

              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <ShoppingBag size={16} className="text-slate-900" /> Historial de Transacciones
                </h4>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  {compras.length} Compras Totales
                </span>
              </div>

              {loading ? (
                <div className="py-20 text-center font-black text-slate-300 animate-pulse">CARGANDO COMPRAS...</div>
              ) : compras.length > 0 ? (
                <div className="grid gap-4">
                  {compras.map(compra => (
                    <div key={compra.compra_id} className="group bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 p-6 rounded-[2.5rem] transition-all flex items-center justify-between hover:shadow-2xl hover:shadow-slate-200/50">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img src={compra.imagen_juego} alt="" className="w-20 h-20 rounded-3xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
                          {compra.reembolsado === 1 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg" title="Reembolsado">
                              <PackageCheck size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xl leading-tight">{compra.nombre_juego}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Calendar size={12} /> {new Date(compra.fecha_compra).toLocaleDateString('es-CL')}
                            </p>
                            <span className="text-[10px] font-black text-indigo-400">ID #{compra.compra_id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${compra.reembolsado === 1 ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                          ${parseFloat(compra.precio_unitario).toLocaleString('es-CL')}
                        </p>
                        {compra.reembolsado === 1 && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Venta Anulada</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-[3rem] py-24 text-center border-2 border-dashed border-slate-200">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <ShoppingBag size={32} className="text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Sin historial de compras</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                <User size={64} className="text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-400 uppercase italic tracking-tighter">Seleccionar Cliente</h3>
              <p className="font-bold text-slate-400 mt-2 max-w-xs">Explora la base de datos de ManaShop seleccionando un perfil de la izquierda.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GestionClientes;