import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  Receipt, 
  DollarSign, 
  Calendar, 
  User, 
  Gamepad2,
  AlertCircle
} from 'lucide-react';

interface Venta {
  compra_id: number;
  fecha_compra: string;
  precio_unitario: string;
  reembolsado: number;
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_email: string;
  nombre_juego: string;
}

const ReporteVentas = () => {
  const [data, setData] = useState<{ listaVentas: Venta[], montoTotalAcumulado: number }>({
    listaVentas: [],
    montoTotalAcumulado: 0
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await axios.get('http://localhost:3001/usuarios/reporte-ventas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Error cargando el reporte", err);
      }
    };
    fetchVentas();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase">Corte de Caja</h2>
          <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" /> 
            Reporte global de ingresos y transacciones de ManaShop
          </p>
        </div>
      </header>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="relative z-10">
            <p className="text-indigo-300 font-black uppercase text-[10px] tracking-[0.4em] mb-4">Monto Total Acumulado</p>
            <h3 className="text-7xl font-black italic tracking-tighter leading-none">
              ${data.montoTotalAcumulado.toLocaleString('es-CL')}
            </h3>
            <p className="mt-6 text-slate-400 font-bold text-sm max-w-md">
              Este valor representa los ingresos netos de la tienda, excluyendo automáticamente todas las ventas marcadas como reembolsadas.
            </p>
          </div>
          <DollarSign className="absolute -right-12 -bottom-12 text-white/5" size={300} />
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl flex flex-col justify-center items-center text-center">
          <div className="bg-indigo-50 p-4 rounded-2xl mb-4 text-indigo-600">
            <Receipt size={32} />
          </div>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Total Transacciones</p>
          <h4 className="text-5xl font-black text-slate-900">{data.listaVentas.length}</h4>
        </div>
      </div>

      {/* TABLA DETALLADA */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-slate-900 uppercase italic flex items-center gap-3 tracking-tighter">
            <Calendar className="text-indigo-600" /> Historial Reciente
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6 text-center">ID</th>
                <th className="px-8 py-6">Fecha</th>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Videojuego</th>
                <th className="px-8 py-6 text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.listaVentas.map((v) => (
                <tr key={v.compra_id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-center font-black text-slate-300 text-xs">#{v.compra_id}</td>
                  <td className="px-8 py-6 font-bold text-slate-500 text-sm italic">
                    {new Date(v.fecha_compra).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm uppercase leading-none">{v.cliente_nombre} {v.cliente_apellido}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{v.cliente_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center gap-2 font-black text-indigo-600 text-sm italic uppercase tracking-tighter">
                      <Gamepad2 size={16} /> {v.nombre_juego}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`font-black text-lg ${v.reembolsado ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                        ${parseFloat(v.precio_unitario).toLocaleString('es-CL')}
                      </span>
                      {v.reembolsado === 1 && (
                        <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded mt-1 flex items-center gap-1 uppercase tracking-tighter">
                          <AlertCircle size={10} /> Reembolsado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReporteVentas;