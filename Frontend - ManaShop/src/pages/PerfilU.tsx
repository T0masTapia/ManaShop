import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Key, 
  LogOut, 
  Gamepad2, 
  Calendar, 
  CreditCard, 
  Undo2, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Perfil = () => {
  const { usuario, setUsuario } = useUser();
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [juegosComprados, setJuegosComprados] = useState<any[]>([]);

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    const fetchJuegos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/perfil/compras/juegos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJuegosComprados(res.data);
      } catch (error) {
        console.error('Error al cargar juegos comprados:', error);
      }
    };

    fetchJuegos();
  }, [usuario, navigate]);

  if (!usuario) return null;

  const cerrarSesion = () => {
    setUsuario(null);
    navigate('/login');
  };

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:3001/usuarios/me',
        { password: nuevoPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensaje('Contraseña actualizada correctamente');
      setNuevoPassword('');

      setTimeout(() => {
        setMensaje('');
        setMostrarModal(false);
      }, 2000);
    } catch (error: any) {
      setMensaje(error.response?.data?.error || 'Error al actualizar contraseña');
    }
  };

  const reembolsarJuego = async (compra_id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres reembolsar este juego?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:3001/perfil/compras/reembolsar/${compra_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || 'Juego reembolsado correctamente');

      setJuegosComprados((prev) =>
        prev.map((juego) =>
          juego.compra_id === compra_id ? { ...juego, reembolsado: 1 } : juego
        )
      );
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al reembolsar el juego');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-in fade-in duration-500">
      
      {/* CABECERA DE PERFIL */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <img
              src={usuario.foto || 'https://i.pravatar.cc/100'}
              alt="Perfil"
              className="w-32 h-32 rounded-[2rem] object-cover ring-4 ring-blue-50 shadow-2xl transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
              <User size={18} />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {usuario.nombre} {usuario.apellido}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <Mail size={18} className="text-blue-500" /> {usuario.email}
              </span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                {usuario.tipo_usuario}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setMostrarModal(true)}
              className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              title="Cambiar Contraseña"
            >
              <Key size={22} />
            </button>
            <button 
              onClick={cerrarSesion}
              className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
              title="Cerrar Sesión"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN JUEGOS COMPRADOS */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8 italic">
          <Gamepad2 size={28} className="text-blue-600 not-italic" /> 
          MIS ADQUISICIONES
        </h2>

        {juegosComprados.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">Aún no has explorado nuestro catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {juegosComprados.map((juego) => (
              <div 
                key={juego.compra_id} 
                className="group bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={juego.image || 'https://placehold.co/400x250'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={juego.name}
                  />
                  {juego.reembolsado && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs">
                        Reembolsado
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate">
                    {juego.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} className="text-blue-500" />
                      <span>{new Date(juego.fecha_compra).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <CreditCard size={14} className="text-emerald-500" />
                      <span>${Number(juego.precio_unitario).toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  {!juego.reembolsado && (
                    <button
                      onClick={() => reembolsarJuego(juego.compra_id)}
                      className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 font-bold transition-all"
                    >
                      <Undo2 size={18} /> Reembolsar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CONTRASEÑA */}
      {mostrarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMostrarModal(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setMostrarModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-2">Cambiar Seguridad</h3>
            <p className="text-slate-500 mb-8 text-sm font-medium italic">Define una nueva clave de acceso</p>

            <form onSubmit={cambiarPassword} className="space-y-6">
              {mensaje && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                  mensaje.includes('correctamente') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {mensaje.includes('correctamente') ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {mensaje}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/10">
                  Actualizar
                </button>
                <button 
                  type="button" 
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;