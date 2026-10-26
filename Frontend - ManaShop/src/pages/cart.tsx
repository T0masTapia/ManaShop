import { useCart } from '../context/cartContext';
import { ShoppingBag, Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatearPrecio } from '../utils/format';

const Cart = () => {
  const { carrito, addToCart, removeFromCart, checkout } = useCart();

  const total = carrito.reduce((sum, game) => sum + game.precio * game.quantity, 0);

  const handleCheckout = async () => {
    if (carrito.length === 0) return;
    if (carrito.length > 1) {
      alert('Solo puedes comprar un juego a la vez.');
      return;
    }
    await checkout();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* TÍTULO */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
          <ShoppingBag className="text-white" size={28} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tu Carrito</h2>
      </div>

      {carrito.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-slate-400" size={32} />
          </div>
          <p className="text-slate-500 text-xl font-medium mb-8">No hay juegos en el carrito todavía.</p>
          <Link 
            to="/" 
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LISTA DE JUEGOS */}
          <div className="lg:col-span-2 space-y-6">
            {carrito.map((game, i) => (
              <div 
                key={i} 
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow"
              >
                {/* Imagen del Juego */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={game.image}
                    alt={game.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info del Juego */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-lg md:text-xl truncate">{game.titulo}</h3>
                  <p className="text-blue-600 font-bold text-sm mb-2">
                    ${formatearPrecio(game.precio)} c/u
                  </p>
                  
                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeFromCart(game)}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-black text-slate-700 w-6 text-center">{game.quantity}</span>
                    <button
                      onClick={() => addToCart(game)}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Subtotal y Eliminar */}
                <div className="text-right flex flex-col items-end gap-2 pr-2">
                  <span className="text-lg font-black text-slate-900">
                    {formatearPrecio(game.precio * game.quantity)}
                  </span>
                  <button 
                    onClick={() => removeFromCart(game)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN DE COMPRA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 sticky top-10">
              <h3 className="text-xl font-black text-slate-900 mb-6">Resumen de Compra</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500">
                  <span>Productos ({carrito.length})</span>
                  <span>{formatearPrecio(total)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Envío Digital</span>
                  <span className="text-green-500 font-bold uppercase text-xs">Gratis</span>
                </div>
                <div className="h-px bg-slate-100 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">
                    {formatearPrecio(total)}
                  </span>
                </div>
              </div>

              {/* Advertencia de solo 1 juego */}
              {carrito.length > 1 && (
                <div className="flex items-start gap-3 bg-amber-50 text-amber-700 p-4 rounded-xl mb-6 text-sm">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p>Por ahora, el sistema solo permite comprar **un juego a la vez**. Por favor, reduce tu carrito.</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={carrito.length !== 1}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
                  carrito.length === 1
                    ? 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Finalizar Compra
              </button>

              <p className="text-center text-slate-400 text-xs mt-6 px-4 leading-relaxed">
                Al hacer clic en comprar, aceptas nuestros términos de servicio y la política de reembolso.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;