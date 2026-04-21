import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, ChevronRight } from 'lucide-react';

const Login = () => {
  const { setUsuario } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      setUsuario(data.usuario);
      navigate('/');
    } catch (error) {
      setError('No se pudo conectar al servidor');
      setLoading(false);
    }
  };

  return (
    /* CAMBIO: Fondo Beige Suave y patrón de puntos muy sutil */
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdf5] px-4 py-12 relative overflow-hidden font-sans">

      {/* DECORACIÓN DE FONDO: Círculos desenfocados en tonos Ámbar/Beige */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-amber-100 rounded-full -ml-48 -mt-48 blur-3xl opacity-50"></div>
      <div className="fixed bottom-0 right-0 w-[30rem] h-[30rem] bg-orange-100 rounded-full -mr-64 -mb-64 blur-3xl opacity-40"></div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in duration-500">
        {/* TARJETA PRINCIPAL: Bordes muy redondeados, sombra suave, fondo blanco puro */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-orange-950/5 border border-slate-100 p-10 md:p-14 text-center relative">

          {/* SECCIÓN DEL LOGO MEJORADA */}
          <div className="relative mx-auto mb-10 w-40 h-28 flex items-center justify-center group">
            {/* Brillo de fondo al hacer hover (sutil) */}
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

            {/* LA IMAGEN DEL LOGO: Más grande, sin fondo azul, con sombra suave */}
            <img
              src="/images/b5e0bd77-6c65-4dad-8ad1-ed02b07ff296.png"
              alt="Logo ManaShop"
              /* h-24 para que sea protagonista, object-contain para no deformar */
              className="relative z-10 h-24 w-auto object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105 rounded-2xl"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-3 tracking-tighter">
            Mana<span className="text-amber-600">Shop</span>
          </h2>
          <p className="text-slate-500 font-medium mb-12 italic leading-relaxed">
            Tu próxima aventura comienza aquí. <br /> Inicia sesión para jugar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* EMAIL */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium placeholder:text-slate-300 text-slate-900"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                <span className="text-xs text-amber-600 font-bold hover:underline cursor-pointer">¿Olvidaste tu clave?</span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium placeholder:text-slate-300 text-slate-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ERROR MESSAGE MEJORADO */}
            {error && (
              <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-xl text-sm font-bold border border-red-200 animate-in shake-1 duration-300">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SUBMIT BUTTON: Ahora Naranja Ámbar con degradado suave */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-2/3 bg-slate-900 text-white py-3.5 !rounded-[20px] font-bold text-base hover:bg-amber-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Entrar a la tienda</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* FOOTER DEL LOGIN */}
          <div className="mt-12 pt-8 border-t border-slate-100 space-y-2">
            <p className="text-slate-500 text-sm">
              ¿Aún no eres parte de la comunidad?
            </p>
            <p className="text-amber-700 font-black text-sm hover:underline cursor-pointer flex items-center justify-center gap-1.5">
              Regístrate aquí <ChevronRight size={16} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;