
import React, { useState, useMemo } from 'react';
import { SaleRecord, Product, ShiftType } from '../types';

interface ReportsProps {
  sales: SaleRecord[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ sales, products }) => {
  const [filterShift, setFilterShift] = useState<ShiftType | 'ALL'>('ALL');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'lifetime'>('today');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredSales = useMemo(() => {
    let timeframeSales = sales;
    if (timeframe === 'today') timeframeSales = sales.filter(s => s.timestamp >= startOfDay);
    if (timeframe === 'week') timeframeSales = sales.filter(s => s.timestamp >= startOfWeek);
    if (timeframe === 'month') timeframeSales = sales.filter(s => s.timestamp >= startOfMonth);

    return filterShift === 'ALL' 
      ? timeframeSales 
      : timeframeSales.filter(s => s.shift === filterShift);
  }, [sales, filterShift, timeframe]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const itemCounts = filteredSales.reduce<Record<string, number>>((acc, s) => {
      s.items.forEach(item => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {});
    
    const topItem = Object.entries(itemCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

    return { totalRevenue, topItem };
  }, [filteredSales]);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytical Reports</h2>
          <p className="text-slate-500">Detailed financial records and product performance.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {(['today', 'week', 'month', 'lifetime'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  timeframe === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {(['ALL', ShiftType.A, ShiftType.B] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterShift(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterShift === type ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All Shifts' : `Shift ${type}`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-money-bill-trend-up"></i>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Revenue ({timeframe})</p>
          <h3 className="text-4xl font-black text-slate-900">${stats.totalRevenue.toFixed(2)}</h3>
        </div>
        
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-trophy"></i>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Top Performer</p>
          <h3 className="text-2xl font-black text-slate-900">
            {stats.topItem ? stats.topItem[0] : 'No Sales'}
          </h3>
          <p className="text-blue-600 font-bold text-sm">{stats.topItem ? `${stats.topItem[1]} units sold` : ''}</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-file-invoice"></i>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Volume</p>
          <h3 className="text-4xl font-black text-slate-900">{filteredSales.length}</h3>
          <p className="text-slate-500 font-bold text-sm">Total Transactions</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-bold">Transaction Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">ID</th>
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-8 py-4">Shift</th>
                <th className="px-8 py-4">Items Summary</th>
                <th className="px-8 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5 font-mono text-xs text-slate-400 group-hover:text-slate-900">{sale.id.slice(-8)}</td>
                  <td className="px-8 py-5 text-sm">{new Date(sale.timestamp).toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">SHIFT {sale.shift}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 truncate max-w-xs">
                    {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900">${sale.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">No records found for the selected criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
