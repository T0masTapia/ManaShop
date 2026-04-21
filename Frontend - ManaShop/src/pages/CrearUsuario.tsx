import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Edit3, Trash2, UserPlus, Users, Mail, Shield, Lock, X } from 'lucide-react';

interface Usuario {
    id: number;
    email: string;
    tipo_usuario: string;
}

interface TipoUsuario {
    tipo_usuario: string;
}

// MODAL REDISEÑADO CON TAILWIND
const Modal = ({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop con desenfoque */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Contenido del Modal */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <button 
                    className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-colors" 
                    onClick={onClose}
                >
                    <X size={24} />
                </button>
                <div className="p-8 md:p-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

const CrearUsuario = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
    const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
    const [emailEdit, setEmailEdit] = useState('');
    const [tipoUsuarioEdit, setTipoUsuarioEdit] = useState('');
    const [passwordEdit, setPasswordEdit] = useState('');

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get<Usuario[]>('http://localhost:3001/usuarios');
            setUsuarios(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchTiposUsuario = async () => {
        try {
            const res = await axios.get<TipoUsuario[]>('http://localhost:3001/usuarios/tipos');
            setTiposUsuario(res.data);
            if (res.data.length > 0) setTipoUsuario(res.data[0].tipo_usuario);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/usuarios', {
                email, password, tipo_usuario: tipoUsuario,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setEmail('');
            setPassword('');
            fetchUsuarios();
            alert('Usuario creado con éxito');
        } catch (error) { alert('Error al crear usuario'); }
    };

    const handleEditarClick = (usuario: Usuario) => {
        setEditandoUsuario(usuario);
        setEmailEdit(usuario.email);
        setTipoUsuarioEdit(usuario.tipo_usuario);
        setPasswordEdit('');
    };

    const handleSubmitEdicion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editandoUsuario) return;
        try {
            const body: any = { email: emailEdit, tipo_usuario: tipoUsuarioEdit };
            if (passwordEdit.trim() !== '') body.password = passwordEdit;
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3001/usuarios/${editandoUsuario.id}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditandoUsuario(null);
            fetchUsuarios();
        } catch (error) { alert('Error al editar'); }
    };

    const handleEliminarUsuario = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/usuarios/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsuarios();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error al eliminar');
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchTiposUsuario();
    }, []);

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                    <Users className="text-white" size={28} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Administración de Usuarios</h2>
                    <p className="text-slate-500 font-medium">Gestiona accesos y roles del sistema</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Formulario de Registro */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <UserPlus size={20} className="text-blue-600" />
                            Nuevo Registro
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Rol de Usuario</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                        value={tipoUsuario}
                                        onChange={e => setTipoUsuario(e.target.value)}
                                        required
                                    >
                                        {tiposUsuario.map(tipo => (
                                            <option key={tipo.tipo_usuario} value={tipo.tipo_usuario}>
                                                {tipo.tipo_usuario}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4">
                                Crear Usuario
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5 font-bold">Usuario</th>
                                    <th className="px-8 py-5 font-bold">Rol</th>
                                    <th className="px-8 py-5 font-bold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {usuarios.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-semibold text-slate-700">{u.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                                u.tipo_usuario === 'admi' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {u.tipo_usuario}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleEditarClick(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => handleEliminarUsuario(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Edición */}
            <Modal show={!!editandoUsuario} onClose={() => setEditandoUsuario(null)}>
                {editandoUsuario && (
                    <>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Editar Perfil</h3>
                        <p className="text-slate-500 mb-8 text-sm">Actualizando datos de ID: {editandoUsuario.id}</p>
                        
                        <form onSubmit={handleSubmitEdicion} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    value={emailEdit}
                                    onChange={e => setEmailEdit(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={passwordEdit}
                                    onChange={e => setPasswordEdit(e.target.value)}
                                    placeholder="Dejar vacío para mantener"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Rol</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={tipoUsuarioEdit}
                                    onChange={e => setTipoUsuarioEdit(e.target.value)}
                                    required
                                >
                                    {tiposUsuario.map(tipo => (
                                        <option key={tipo.tipo_usuario} value={tipo.tipo_usuario}>
                                            {tipo.tipo_usuario}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
                                    Guardar
                                </button>
                                <button 
                                    type="button" 
                                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                    onClick={() => setEditandoUsuario(null)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default CrearUsuario;