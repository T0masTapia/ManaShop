import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Layers, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface Tipo {
  id: number;
  category: string;
}

const Tipos = () => {
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState('');

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await axios.get('http://localhost:3001/tipos');
        setTipos(res.data);
      } catch (err) {
        setError('No se pudieron cargar las categorías');
      } finally {
        setLoading(false);
      }
    };
    fetchTipos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    if (!newCategory.trim()) {
      setPostError('Escribe un nombre para la categoría');
      return;
    }

    setPosting(true);
    try {
      const res = await axios.post('http://localhost:3001/tipos', { category: newCategory });
      setTipos([...tipos, res.data]);
      setNewCategory('');
    } catch (error) {
      setPostError('Error al crear el tipo');
    } finally {
      setPosting(false);
    }
  };

  const startEditing = (tipo: Tipo) => {
    setEditingId(tipo.id);
    setEditingCategory(tipo.category);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingCategory('');
  };

  const saveEdit = async (id: number) => {
    if (!editingCategory.trim()) return;
    try {
      await axios.patch(`http://localhost:3001/tipos/${id}`, { category: editingCategory });
      setTipos(tipos.map(t => (t.id === id ? { ...t, category: editingCategory } : t)));
      cancelEditing();
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  const deleteTipo = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría? Los juegos asociados podrían verse afectados.')) return;
    try {
      await axios.delete(`http://localhost:3001/tipos/${id}`);
      setTipos(tipos.filter(t => t.id !== id));
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-100">
          <Layers className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Categorías</h2>
          <p className="text-slate-500 font-medium">Gestiona los géneros de tu catálogo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* LISTADO DE CATEGORÍAS */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Géneros Actuales</h3>
          
          {loading ? (
            <div className="flex items-center gap-3 text-slate-400 p-8 justify-center">
              <Loader2 className="animate-spin" /> <span>Cargando...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {tipos.map(tipo => (
                <div 
                  key={tipo.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    editingId === tipo.id 
                    ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.02]' 
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                  }`}
                >
                  {editingId === tipo.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        className="flex-1 bg-white px-3 py-1 rounded-lg outline-none ring-2 ring-emerald-500 font-medium"
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => saveEdit(tipo.id)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEditing} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-slate-700">{tipo.category}</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => startEditing(tipo)} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deleteTipo(tipo.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {tipos.length === 0 && !loading && (
                <p className="text-center py-10 text-slate-400 italic">No hay categorías registradas.</p>
              )}
            </div>
          )}
        </section>

        {/* FORMULARIO PARA AGREGAR */}
        <section>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 sticky top-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PlusCircle className="text-emerald-500" />
              Nueva Categoría
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="newCategory" className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                  Nombre de la categoría
                </label>
                <input
                  id="newCategory"
                  type="text"
                  placeholder="Ej: RPG, Acción, Terror..."
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={posting}
                />
              </div>

              {postError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm font-medium">
                  <AlertCircle size={18} />
                  {postError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={posting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {posting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={20} />
                    Agregar Categoría
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Tipos;