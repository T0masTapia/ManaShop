import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Edit3,
    Trash2,
    UserPlus,
    Users,
    Mail,
    Shield,
    Lock,
    X,
    Search,
    ShieldCheck,
    UserCheck,
    KeyRound
} from 'lucide-react';

interface Usuario {
    id: number;
    email: string;
    tipo_usuario: string;
    profile_picture?: string | null;
}

interface TipoUsuario {
    tipo_usuario: string;
}

const Modal = ({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                    className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    onClick={onClose}
                >
                    <X size={20} />
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
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get<Usuario[]>('http://localhost:3001/usuarios');
            setUsuarios(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTiposUsuario = async () => {
        try {
            const res = await axios.get<TipoUsuario[]>('http://localhost:3001/usuarios/tipos');
            setTiposUsuario(res.data);
            if (res.data.length > 0) setTipoUsuario(res.data[0].tipo_usuario);
        } catch (error) {
            console.error(error);
        }
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
        } catch (error) {
            alert('Error al crear usuario');
        }
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
        } catch (error) {
            alert('Error al editar usuario');
        }
    };

    const handleEliminarUsuario = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/usuarios/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsuarios();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error al eliminar usuario');
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchTiposUsuario();
    }, []);

    const totalAdmins = usuarios.filter(u => u.tipo_usuario === 'admi' || u.tipo_usuario === 'admin').length;
    const totalClientes = usuarios.filter(u => u.tipo_usuario === 'cliente').length;

    const usuariosFiltrados = usuarios.filter(u => {
        const matchBusqueda = u.email.toLowerCase().includes(busqueda.toLowerCase());
        const matchRol = filtroRol === 'todos' || u.tipo_usuario === filtroRol;
        return matchBusqueda && matchRol;
    });

    const getRoleBadgeStyle = (rol: string) => {
        switch (rol.toLowerCase()) {
            case 'admi':
            case 'admin':
                return 'bg-purple-50 text-purple-700 border-purple-200/80';
            case 'ejecutivo':
                return 'bg-amber-50 text-amber-700 border-amber-200/80';
            case 'cliente':
                return 'bg-blue-50 text-blue-700 border-blue-200/80';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 animate-in fade-in duration-500 space-y-8">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black tracking-wider uppercase mb-2">
                        <ShieldCheck size={14} /> Panel Administrativo
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Administración de Usuarios
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Gestiona accesos, credenciales y privilegios en el sistema
                    </p>
                </div>
            </div>

            {/* TARJETAS DE MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Usuarios</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{usuarios.length}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administradores</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{totalAdmins}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
                        <Shield size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{totalClientes}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                        <UserCheck size={24} />
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* FORMULARIO DE REGISTRO */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-7 md:p-8 shadow-xl shadow-slate-100/60 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Nuevo Usuario</h2>
                            <p className="text-xs text-slate-400 font-medium">Registra una nueva cuenta en el sistema</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold text-sm text-slate-800"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="usuario@manashop.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold text-sm text-slate-800"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Rol en el Sistema
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <select
                                    className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none font-semibold text-sm text-slate-800 cursor-pointer"
                                    value={tipoUsuario}
                                    onChange={e => setTipoUsuario(e.target.value)}
                                    required
                                >
                                    {tiposUsuario.map(tipo => (
                                        <option key={tipo.tipo_usuario} value={tipo.tipo_usuario}>
                                            {tipo.tipo_usuario.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 !rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/25 active:scale-98 cursor-pointer"
                        >
                            Registrar Usuario
                        </button>
                    </form>
                </div>

                {/* TABLA DE USUARIOS Y FILTROS */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl shadow-slate-100/60 border border-slate-100 overflow-hidden flex flex-col">

                    {/* BARRA DE BÚSQUEDA Y FILTROS */}
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por correo..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-xs font-semibold"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs font-bold text-slate-400">Rol:</span>
                            <select
                                value={filtroRol}
                                onChange={(e) => setFiltroRol(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="todos">Todos los Roles</option>
                                {tiposUsuario.map(t => (
                                    <option key={t.tipo_usuario} value={t.tipo_usuario}>
                                        {t.tipo_usuario.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* TABLA */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-black">ID</th>
                                    <th className="px-6 py-4 font-black">Email</th>
                                    <th className="px-6 py-4 font-black">Rol</th>
                                    <th className="px-6 py-4 font-black text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80 text-sm">
                                {usuariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-semibold">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosFiltrados.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-slate-400 text-xs">
                                                #{u.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {u.profile_picture ? (
                                                        <img
                                                            src={u.profile_picture}
                                                            alt={u.email}
                                                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
                                                            onError={(e) => {
                                                                (e.target as HTMLElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        /* Inicial proporcional */
                                                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-xs">
                                                            {u.email.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-slate-800 text-sm">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeStyle(u.tipo_usuario)}`}>
                                                    {u.tipo_usuario}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditarClick(u)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                                        title="Editar usuario"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarUsuario(u.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                                        title="Eliminar usuario"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* MODAL DE EDICIÓN */}
            <Modal show={!!editandoUsuario} onClose={() => setEditandoUsuario(null)}>
                {editandoUsuario && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <KeyRound size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Editar Usuario</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">ID del registro: #{editandoUsuario.id}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitEdicion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold text-sm text-slate-800"
                                    value={emailEdit}
                                    onChange={e => setEmailEdit(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-semibold text-sm text-slate-800"
                                    value={passwordEdit}
                                    onChange={e => setPasswordEdit(e.target.value)}
                                    placeholder="Dejar vacío para conservar la actual"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Rol
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none font-semibold text-sm text-slate-800 cursor-pointer"
                                    value={tipoUsuarioEdit}
                                    onChange={e => setTipoUsuarioEdit(e.target.value)}
                                    required
                                >
                                    {tiposUsuario.map(tipo => (
                                        <option key={tipo.tipo_usuario} value={tipo.tipo_usuario}>
                                            {tipo.tipo_usuario.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-slate-900/10"
                                >
                                    Guardar Cambios
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                                    onClick={() => setEditandoUsuario(null)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default CrearUsuario;