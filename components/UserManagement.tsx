
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({ role: UserRole.USER });

  const handleAddUser = () => {
    if (!formData.username || !formData.password) return;
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: formData.username,
      password: formData.password,
      role: formData.role || UserRole.USER
    };
    onUpdateUsers([...users, newUser]);
    setFormData({ role: UserRole.USER });
    setShowAdd(false);
  };

  const removeUser = (id: string) => {
    if (confirm('Delete this user account?')) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-slate-500">Create and manage staff credentials.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl transition-all font-bold text-sm flex items-center gap-2 shadow-lg"
        >
          <i className="fas fa-user-plus"></i>
          Create Account
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                user.role === UserRole.MANAGER ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <i className={`fas ${user.role === UserRole.MANAGER ? 'fa-user-shield' : 'fa-user'}`}></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">{user.username}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{user.role}</p>
              </div>
            </div>
            {user.username !== 'admin' && (
              <button 
                onClick={() => removeUser(user.id)}
                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 w-10 h-10 rounded-xl transition-all"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold">New Staff Account</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                <select 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.USER}>Standard Cashier</option>
                  <option value={UserRole.MANAGER}>Store Manager</option>
                </select>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
              <button onClick={handleAddUser} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30">Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
