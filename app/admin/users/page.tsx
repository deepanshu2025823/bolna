// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', balance: '' });
  const [formStatus, setFormStatus] = useState<{ type: 'idle'|'loading'|'success'|'error', msg: string }>({ type: 'idle', msg: '' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', msg: '' });
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setFormStatus({ type: 'success', msg: 'Client created successfully!' });
        fetchUsers();
        setTimeout(() => { setIsCreateModalOpen(false); resetForm(); }, 1500);
      } else setFormStatus({ type: 'error', msg: data.message });
    } catch (error) { setFormStatus({ type: 'error', msg: 'Error creating client' }); }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', balance: user.balance });
    setFormStatus({ type: 'idle', msg: '' });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', msg: '' });
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, ...formData }),
      });
      const data = await res.json();
      if (data.success) {
        setFormStatus({ type: 'success', msg: 'Client updated successfully!' });
        fetchUsers();
        setTimeout(() => { setIsEditModalOpen(false); resetForm(); }, 1500);
      } else setFormStatus({ type: 'error', msg: data.message });
    } catch (error) { setFormStatus({ type: 'error', msg: 'Error updating client' }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) { alert('Failed to delete'); }
  };

  const handleClearAll = async () => {
    if (!confirm('WARNING: This will delete ALL clients and their data. Proceed?')) return;
    try {
      await fetch('/api/admin/users?action=clear_all', { method: 'DELETE' });
      fetchUsers();
    } catch (error) { alert('Failed to clear data'); }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', balance: '' });
    setFormStatus({ type: 'idle', msg: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clients Management</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage users, update wallets, or clear system records.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={handleClearAll}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors border border-red-200"
          >
            Clear All Data
          </button>
          <button 
            onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sub-Account ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Loading clients...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No clients found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs font-medium text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono">{user.bolna_sub_account_id}</span></td>
                    <td className="px-6 py-4"><p className="text-sm font-bold text-emerald-600">${Number(user.balance).toFixed(2)}</p></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(user)} className="text-slate-400 hover:text-blue-600 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-600 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => {setIsCreateModalOpen(false); setIsEditModalOpen(false);}}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{isEditModalOpen ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => {setIsCreateModalOpen(false); setIsEditModalOpen(false);}} className="text-slate-400 hover:text-slate-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit} className="p-6 space-y-4">
              {formStatus.type === 'error' && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{formStatus.msg}</div>}
              {formStatus.type === 'success' && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl font-medium">{formStatus.msg}</div>}

              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label><input type="text" required className="w-full px-4 py-2 border rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label><input type="email" required className="w-full px-4 py-2 border rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              
              {isEditModalOpen && (
                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Wallet Balance ($)</label><input type="number" step="0.01" required className="w-full px-4 py-2 border rounded-xl" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} /></div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{isEditModalOpen ? 'New Password (Optional)' : 'Initial Password'}</label>
                <input type="password" required={!isEditModalOpen} className="w-full px-4 py-2 border rounded-xl" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <button type="submit" disabled={formStatus.type === 'loading'} className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl mt-4 hover:bg-slate-800">
                {formStatus.type === 'loading' ? 'Processing...' : (isEditModalOpen ? 'Save Changes' : 'Create Client')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}