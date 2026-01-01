
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Product, SaleRecord, ShiftRecord, ShiftType, AppState } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import UserManagement from './components/UserManagement';
import ShiftManager from './components/ShiftManager';
import Reports from './components/Reports';

const STORAGE_KEY = 'sellespro_data';

const INITIAL_DATA: AppState = {
  currentUser: null,
  activeShift: null,
  products: [
    { id: '1', name: 'Coffee Beans', quantity: 50, localCode: 'COF01', barCode: '1001001', price: 15.50 },
    { id: '2', name: 'Milk 1L', quantity: 30, localCode: 'MILK01', barCode: '2002002', price: 2.50 },
    { id: '3', name: 'Sugar 1kg', quantity: 100, localCode: 'SUG01', barCode: '3003003', price: 1.20 },
  ],
  sales: [],
  users: [
    { id: 'admin', username: 'admin', role: UserRole.MANAGER, password: 'password' },
    { id: 'user1', username: 'cashier1', role: UserRole.USER, password: 'password' },
  ],
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'pos' | 'inventory' | 'users' | 'reports'>('dashboard');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    // If manager, dashboard. If user, POS.
    setCurrentView(user.role === UserRole.MANAGER ? 'dashboard' : 'pos');
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const activateShift = (type: ShiftType) => {
    if (!state.currentUser) return;
    const newShift: ShiftRecord = {
      id: `shift_${Date.now()}`,
      userId: state.currentUser.id,
      startTime: Date.now(),
      type,
      isActive: true,
    };
    setState(prev => ({ ...prev, activeShift: newShift }));
  };

  const deactivateShift = () => {
    setState(prev => ({ ...prev, activeShift: null }));
  };

  const updateProducts = (newProducts: Product[]) => {
    setState(prev => ({ ...prev, products: newProducts }));
  };

  const processSale = (sale: SaleRecord) => {
    setState(prev => {
      // Deduct quantities
      const updatedProducts = prev.products.map(p => {
        const saleItem = sale.items.find(si => si.productId === p.id);
        if (saleItem) {
          return { ...p, quantity: p.quantity - saleItem.quantity };
        }
        return p;
      });

      return {
        ...prev,
        sales: [...prev.sales, sale],
        products: updatedProducts,
      };
    });
  };

  const updateUserList = (users: User[]) => {
    setState(prev => ({ ...prev, users }));
  };

  if (!state.currentUser) {
    return <Login users={state.users} onLogin={handleLogin} />;
  }

  // Mandatory shift activation for non-managers
  if (state.currentUser.role === UserRole.USER && !state.activeShift) {
    return <ShiftManager onActivate={activateShift} onLogout={handleLogout} />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="no-print">
        <Sidebar 
          user={state.currentUser} 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onLogout={handleLogout}
          activeShift={state.activeShift}
          onDeactivateShift={deactivateShift}
        />
      </div>
      
      <main className="flex-1 overflow-auto p-8 relative">
        {currentView === 'dashboard' && <Dashboard state={state} />}
        {currentView === 'pos' && (
          <POS 
            products={state.products} 
            activeShift={state.activeShift} 
            currentUser={state.currentUser}
            onSale={processSale} 
          />
        )}
        {currentView === 'inventory' && (
          <Inventory 
            products={state.products} 
            onUpdateProducts={updateProducts} 
          />
        )}
        {currentView === 'users' && state.currentUser.role === UserRole.MANAGER && (
          <UserManagement 
            users={state.users} 
            onUpdateUsers={updateUserList} 
          />
        )}
        {currentView === 'reports' && (
          <Reports 
            sales={state.sales} 
            products={state.products} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
