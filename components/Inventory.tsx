
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdateProducts }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.localCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = filterType === 'low' ? p.quantity < 10 : true;
      return matchesSearch && matchesStock;
    });
  }, [products, searchQuery, filterType]);

  const handleDelete = (id: string) => {
    if (confirm('Permanently remove this product? This action is irreversible.')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
  };

  const handleRestock = (product: Product) => {
    setRestockingId(product.id);
    setRestockAmount(10); // Default restock amount
  };

  const commitRestock = () => {
    if (!restockingId) return;
    onUpdateProducts(products.map(p => 
      p.id === restockingId ? { ...p, quantity: p.quantity + restockAmount } : p
    ));
    setRestockingId(null);
  };

  const saveProduct = () => {
    if (!formData.name || !formData.localCode) return;

    if (editingId) {
      onUpdateProducts(products.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
    } else {
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        name: formData.name || '',
        quantity: formData.quantity || 0,
        localCode: formData.localCode || '',
        barCode: formData.barCode || '',
        price: formData.price || 0,
      };
      onUpdateProducts([...products, newProduct]);
    }
    closeModals();
  };

  const closeModals = () => {
    setEditingId(null);
    setRestockingId(null);
    setShowAddModal(false);
    setFormData({});
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Master Catalog</h2>
          <p className="text-slate-500 font-medium">Add products, track low stock, and manage purchasing.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95"
          >
            <i className="fas fa-plus-circle text-lg"></i>
            ADD NEW PRODUCT
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-[30rem] group">
          <i className="fas fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search items by name, barcode or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:outline-none font-bold text-sm transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${filterType === 'all' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Full List
          </button>
          <button 
            onClick={() => setFilterType('low')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${filterType === 'low' ? 'bg-white shadow-lg text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Low Stock Only
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Product & Details</th>
                <th className="px-10 py-6">Price Point</th>
                <th className="px-10 py-6">Stock Status</th>
                <th className="px-10 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{product.name}</span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black tracking-widest">{product.localCode}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{product.barCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="font-black text-slate-900 text-xl">${product.price.toFixed(2)}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${product.quantity < 10 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`} 
                          style={{width: `${Math.min(100, product.quantity)}%`}}
                        />
                      </div>
                      <span className={`text-xs font-black whitespace-nowrap ${product.quantity < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {product.quantity} units
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right space-x-2">
                    <button 
                      onClick={() => handleRestock(product)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-black text-[10px] transition-all"
                      title="Quick Restock"
                    >
                      <i className="fas fa-cart-plus"></i>
                      RESTOCK
                    </button>
                    <button onClick={() => handleEdit(product)} className="w-10 h-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <i className="fas fa-pen-to-square text-xs"></i>
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                      <i className="fas fa-trash-can text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Inventory Purchase</h3>
              <p className="text-slate-400 font-bold text-sm mb-8">Restocking: {products.find(p => p.id === restockingId)?.name}</p>
              
              <div className="flex items-center justify-center gap-6 mb-10">
                <button 
                  onClick={() => setRestockAmount(Math.max(1, restockAmount - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xl font-black"
                >-</button>
                <div className="text-4xl font-black text-slate-900">{restockAmount}</div>
                <button 
                  onClick={() => setRestockAmount(restockAmount + 1)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xl font-black"
                >+</button>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setRestockingId(null)} className="flex-1 py-4 font-black text-slate-400 text-xs uppercase tracking-widest">Cancel</button>
                <button 
                  onClick={commitRestock}
                  className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 text-xs uppercase tracking-widest"
                >Confirm Purchase</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Edit/Add Modal */}
      {(showAddModal || editingId) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingId ? 'Edit Product' : 'Register New Item'}</h3>
              <button onClick={closeModals} className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 shadow-sm transition-all"><i className="fas fa-xmark"></i></button>
            </div>
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Item Name</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-slate-800"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Local Code (SKU)</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-slate-800"
                  value={formData.localCode || ''}
                  onChange={(e) => setFormData({ ...formData, localCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Barcode</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-slate-800"
                  value={formData.barCode || ''}
                  onChange={(e) => setFormData({ ...formData, barCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Unit Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-all font-black text-slate-800"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Initial Stock</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-all font-black text-slate-800"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="p-10 bg-slate-50 flex gap-6">
              <button onClick={closeModals} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs">Cancel</button>
              <button onClick={saveProduct} className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">
                Save Product Information
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
