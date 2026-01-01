
import React from 'react';
import { User, UserRole, ShiftRecord } from '../types';

interface SidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: any) => void;
  onLogout: () => void;
  activeShift: ShiftRecord | null;
  onDeactivateShift: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, currentView, onViewChange, onLogout, activeShift, onDeactivateShift 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', roles: [UserRole.MANAGER, UserRole.USER] },
    { id: 'pos', label: 'Point of Sale', icon: 'fa-cash-register', roles: [UserRole.USER] },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked', roles: [UserRole.MANAGER, UserRole.USER] },
    { id: 'users', label: 'User Management', icon: 'fa-users-gear', roles: [UserRole.MANAGER] },
    { id: 'reports', label: 'Sales Reports', icon: 'fa-file-invoice-dollar', roles: [UserRole.MANAGER] },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white h-full flex flex-col border-r border-slate-800/50 shadow-2xl">
      <div className="p-8 border-b border-slate-900">
        <h1 className="text-2xl font-black text-blue-500 flex items-center gap-3 tracking-tighter">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-blue-500/20">
            <i className="fas fa-bolt"></i>
          </div>
          SELLESPRO
        </h1>
        <div className="mt-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Profile</p>
          <p className="font-bold text-slate-200 truncate">{user.username}</p>
          <p className="text-[10px] text-blue-400 font-bold uppercase">{user.role}</p>
          
          {activeShift && (
            <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 p-2 rounded-xl text-[10px] border border-emerald-500/20 text-emerald-400 font-black uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Shift {activeShift.type} Active
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.filter(item => item.roles.includes(user.role)).map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              currentView === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center group-hover:scale-110 transition-transform`}></i>
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-900 space-y-2">
        {activeShift && user.role === UserRole.USER && (
          <button
            onClick={onDeactivateShift}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-amber-500 hover:bg-amber-500/10 transition-all font-bold text-sm"
          >
            <i className="fas fa-power-off w-5 text-center"></i>
            End Current Shift
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm"
        >
          <i className="fas fa-right-from-bracket w-5 text-center"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
