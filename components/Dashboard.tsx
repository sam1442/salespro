
import React, { useEffect, useState, useMemo } from 'react';
import { AppState, UserRole, SaleRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSalesInsights } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // For users, show only their sales. For managers, show all.
  const filteredSales = useMemo(() => {
    const threshold = period === 'day' ? startOfDay : period === 'week' ? startOfWeek : startOfMonth;
    let pool = state.sales;
    if (state.currentUser?.role === UserRole.USER) {
      pool = pool.filter(s => s.userId === state.currentUser?.id);
    }
    return pool.filter(s => s.timestamp >= threshold);
  }, [state.sales, period, state.currentUser]);

  const periodRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const lowStock = state.products.filter(p => p.quantity < 10).length;
  
  // Simulated Active Staff logic (anyone with a record in the last hour could be considered "active" or simply the currentUser)
  const activeStaff = useMemo(() => {
    return state.users.filter(u => u.id === state.currentUser?.id || state.sales.some(s => s.userId === u.id && s.timestamp > now.getTime() - 3600000));
  }, [state.users, state.sales, state.currentUser]);

  useEffect(() => {
    if (state.currentUser?.role === UserRole.MANAGER || state.currentUser?.role === UserRole.USER) {
      setLoadingAi(true);
      getSalesInsights(filteredSales, state.products)
        .then(setAiInsight)
        .finally(() => setLoadingAi(false));
    }
  }, [filteredSales, state.products, state.currentUser?.role]);

  const stats = [
    { label: state.currentUser?.role === UserRole.USER ? 'My Day Revenue' : `${period.charAt(0).toUpperCase() + period.slice(1)} Revenue`, value: `$${periodRevenue.toLocaleString()}`, icon: 'fa-sack-dollar', color: 'bg-emerald-500' },
    { label: 'Low Stock Alerts', value: lowStock, icon: 'fa-box-open', color: 'bg-rose-500' },
    { label: 'Items in Catalog', value: state.products.length, icon: 'fa-layer-group', color: 'bg-blue-500' },
    { label: 'Active Staff', value: activeStaff.length, icon: 'fa-user-clock', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 pb-12 bg-slate-50/30 min-h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Performance Central</h2>
          <p className="text-slate-500 font-medium">Monitoring {state.currentUser?.role === UserRole.USER ? 'your productivity' : 'store operations'}</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 ${
                period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
            <div className={`${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-${stat.color.split('-')[1]}-500/20 group-hover:rotate-6 transition-transform`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900">Revenue Flow</h3>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-blue-500"></span>
               <span className="text-xs font-bold text-slate-500">Period: {period}</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredSales.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="id" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px' }}
                />
                <Bar dataKey="totalAmount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          {/* Active Staff List */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
              <i className="fas fa-users-viewfinder text-blue-500"></i>
              Active Team
            </h3>
            <div className="space-y-4">
              {activeStaff.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-blue-600 text-xs">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{u.username}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{u.role}</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/5">
                <i className="fas fa-microchip"></i>
              </div>
              <h3 className="text-lg font-black tracking-tight">AI Strategy</h3>
            </div>
            
            <div className="relative z-10">
              {loadingAi ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-2.5 bg-white/10 rounded-full w-3/4"></div>
                  <div className="h-2.5 bg-white/10 rounded-full"></div>
                  <div className="h-2.5 bg-white/10 rounded-full w-5/6"></div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-slate-400 font-medium">
                  {aiInsight ? (
                    <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <p className="italic">AI is synthesizing current shift data...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
