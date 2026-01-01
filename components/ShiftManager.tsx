
import React from 'react';
import { ShiftType } from '../types';

interface ShiftManagerProps {
  onActivate: (type: ShiftType) => void;
  onLogout: () => void;
}

const ShiftManager: React.FC<ShiftManagerProps> = ({ onActivate, onLogout }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
            <i className="fas fa-clock"></i>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Activate Your Shift</h2>
          <p className="text-slate-500 leading-relaxed">Please select your current shift to start processing sales. This session will persist until you close the shift.</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <button 
            onClick={() => onActivate(ShiftType.A)}
            className="group p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-4 active:scale-95"
          >
            <span className="text-4xl font-black text-slate-300 group-hover:text-blue-600 transition-colors">A</span>
            <span className="font-bold text-slate-600 group-hover:text-blue-900">Shift A</span>
          </button>
          
          <button 
            onClick={() => onActivate(ShiftType.B)}
            className="group p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-4 active:scale-95"
          >
            <span className="text-4xl font-black text-slate-300 group-hover:text-indigo-600 transition-colors">B</span>
            <span className="font-bold text-slate-600 group-hover:text-indigo-900">Shift B</span>
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="w-full text-center py-4 text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors"
        >
          Cancel and Logout
        </button>
      </div>
    </div>
  );
};

export default ShiftManager;
