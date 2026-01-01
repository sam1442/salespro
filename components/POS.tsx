
import React, { useState, useMemo } from 'react';
import { Product, CartItem, SaleRecord, ShiftRecord, User } from '../types';

interface POSProps {
  products: Product[];
  activeShift: ShiftRecord | null;
  currentUser: User;
  onSale: (sale: SaleRecord) => void;
}

const POS: React.FC<POSProps> = ({ products, activeShift, currentUser, onSale }) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [printing, setPrinting] = useState<SaleRecord | null>(null);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.localCode.toLowerCase().includes(term) || 
      p.barCode.toLowerCase().includes(term)
    );
  }, [products, search]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    const currentQtyInCart = existing ? existing.cartQuantity : 0;

    if (currentQtyInCart >= product.quantity) {
      alert(`Insufficient stock for ${product.name}. Only ${product.quantity} available.`);
      return;
    }

    setCart(prev => {
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1, editedPrice: product.price }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = Math.max(1, item.cartQuantity + delta);
        
        if (product && newQty > product.quantity) {
          alert("Cannot exceed available stock.");
          return item;
        }
        
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const updatePrice = (id: string, price: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, editedPrice: price } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm("Clear all items from shopping cart?")) {
      setCart([]);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.editedPrice * item.cartQuantity), 0);

  const handleProcessSale = () => {
    if (cart.length === 0 || !activeShift) return;

    const sale: SaleRecord = {
      id: `sale_${Date.now()}`,
      timestamp: Date.now(),
      userId: currentUser.id,
      shift: activeShift.type,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.cartQuantity,
        price: item.editedPrice,
        total: item.cartQuantity * item.editedPrice,
      })),
      totalAmount: total,
    };

    onSale(sale);
    setPrinting(sale);
    setCart([]);
    
    setTimeout(() => {
      window.print();
      setPrinting(null);
    }, 500);
  };

  return (
    <div className="flex gap-8 h-full bg-slate-50/50">
      <div className="flex-1 flex flex-col no-print">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Point of Sale</h2>
            <p className="text-slate-500 font-medium">Terminal Active: Shift {activeShift?.type}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operator</span>
            <p className="font-black text-slate-900">{currentUser.username}</p>
          </div>
        </header>

        <div className="relative mb-8 group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
          <input
            type="text"
            placeholder="Real-time product search (Name, Barcode, Local Code)..."
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-12 pr-2 custom-scrollbar">
          {filteredProducts.map(product => {
            const inCart = cart.find(c => c.id === product.id)?.cartQuantity || 0;
            const remaining = product.quantity - inCart;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={remaining <= 0}
                className={`group p-6 bg-white rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between hover:shadow-xl active:scale-[0.98] ${
                  remaining <= 0 ? 'opacity-40 grayscale border-slate-100' : 'border-white hover:border-blue-500 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                      {product.localCode}
                    </span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      remaining < 10 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'
                    }`}>
                      Stock: {remaining}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-800 text-xl leading-tight mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-tighter mb-4">{product.barCode}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <i className="fas fa-plus text-xs"></i>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-[26rem] bg-white border-l border-slate-100 p-8 flex flex-col shadow-2xl no-print rounded-l-[3rem]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-sm">
              <i className="fas fa-cart-shopping"></i>
            </div>
            Checkout
          </h3>
          <button 
            onClick={clearCart}
            className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center px-10">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl mb-6">
                <i className="fas fa-shopping-basket"></i>
              </div>
              <p className="font-bold text-slate-400">Your basket is waiting for some products...</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-blue-100 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-black text-slate-800 text-sm truncate pr-4">{item.name}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <i className="fas fa-trash-can text-xs"></i>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-50 transition-colors text-slate-400"
                    >
                      <i className="fas fa-minus text-[10px]"></i>
                    </button>
                    <span className="px-4 font-black text-slate-900 text-sm">{item.cartQuantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-50 transition-colors text-slate-400"
                    >
                      <i className="fas fa-plus text-[10px]"></i>
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-blue-600">
                      <span className="text-xs font-bold">$</span>
                      <input 
                        type="number"
                        value={item.editedPrice}
                        onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-16 text-right bg-transparent focus:outline-none font-black text-sm"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Sum: ${(item.editedPrice * item.cartQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-8 border-t-2 border-slate-50 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
              <span>Tax (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-slate-900">Total Payable</span>
              <span className="text-3xl font-black text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleProcessSale}
            disabled={cart.length === 0}
            className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${
              cart.length === 0 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.97]'
            }`}
          >
            <i className="fas fa-print"></i>
            Finalize Sale
          </button>
        </div>
      </div>

      {printing && (
        <div className="print-only fixed inset-0 bg-white p-12 font-mono text-sm leading-relaxed text-black">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Sellespro POS</h1>
            <p className="font-bold italic">Smart Sales Management</p>
            <div className="border-b-2 border-black border-double my-6"></div>
            <div className="text-left space-y-1">
              <p className="flex justify-between font-bold"><span>TXN REF:</span> <span>{printing.id}</span></p>
              <p className="flex justify-between"><span>DATE:</span> <span>{new Date(printing.timestamp).toLocaleString()}</span></p>
              <p className="flex justify-between"><span>CASHIER:</span> <span>{currentUser.username}</span></p>
              <p className="flex justify-between"><span>SHIFT ID:</span> <span>{printing.shift}</span></p>
            </div>
            <div className="border-b border-black border-dashed my-6"></div>
          </div>
          <table className="w-full mb-10">
            <thead>
              <tr className="border-b-2 border-black text-left font-black">
                <th className="py-2">DESCRIPTION</th>
                <th className="py-2 text-right">QTY</th>
                <th className="py-2 text-right">PRICE</th>
                <th className="py-2 text-right">SUM</th>
              </tr>
            </thead>
            <tbody>
              {printing.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 uppercase font-bold">{item.name}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-black">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t-2 border-black pt-6 space-y-2">
            <div className="flex justify-between font-black text-2xl">
              <span>NET TOTAL</span>
              <span>${printing.totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-center mt-12 opacity-70">
              * Thank you for choosing Sellespro *<br/>
              Please keep this receipt for your records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
