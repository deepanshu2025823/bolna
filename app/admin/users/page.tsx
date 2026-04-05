// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('all'); 
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  
  // 🚀 NEW: Call Logs / Executions States 🚀
  const [isExecutionsModalOpen, setIsExecutionsModalOpen] = useState(false);
  const [executionsData, setExecutionsData] = useState<any[]>([]);
  const [isExecutionsLoading, setIsExecutionsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', balance: '', role: 'client' });
  const [formStatus, setFormStatus] = useState<{ type: 'idle'|'loading'|'success'|'error', msg: string }>({ type: 'idle', msg: '' });

  useEffect(() => {
    const fetchAccessAndUsers = async () => {
      try {
        setIsLoading(true);
        
        const profileRes = await fetch('/api/user/profile');
        const profileData = await profileRes.json();
        
        if (!profileData.success) {
          router.push('/login');
          return;
        }

        const role = profileData.data.role;
        const permissions = profileData.data.permissions || [];

        if (role === 'admin' || permissions.includes('manage_users')) {
          setHasAccess(true);
          
          const res = await fetch(`/api/admin/users?timeframe=${timeframe}`);
          const data = await res.json();
          if (data.success) setUsers(data.data);
        } else {
          router.push('/admin/dashboard');
          return;
        }

      } catch (error) {
        console.error('Failed to verify access or fetch users');
      }
      setIsLoading(false);
    };

    fetchAccessAndUsers();
  }, [timeframe, router]); 

  const fetchOnlyUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?timeframe=${timeframe}`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

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
        setFormStatus({ type: 'success', msg: 'User created successfully!' });
        fetchOnlyUsers();
        setTimeout(() => { setIsCreateModalOpen(false); resetForm(); }, 1500);
      } else setFormStatus({ type: 'error', msg: data.message });
    } catch (error) { setFormStatus({ type: 'error', msg: 'Error creating user' }); }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', balance: user.balance || 0, role: user.role || 'client' });
    setFormStatus({ type: 'idle', msg: '' });
    setIsEditModalOpen(true);
  };

  // 🚀 NEW: Fetch & Open Executions Modal Function 🚀
  const openExecutionsModal = async (user: any) => {
    setSelectedUser(user);
    setIsExecutionsModalOpen(true);
    setIsExecutionsLoading(true);
    setExecutionsData([]);

    try {
      // Calls the new API route we created for executions
      const res = await fetch(`/api/admin/users/executions?sub_account_id=${user.bolna_sub_account_id}`);
      const data = await res.json();
      if (data.success) {
        setExecutionsData(data.data || []);
      } else {
        console.error(data.message);
      }
    } catch (e) {
      console.error("Failed to fetch executions", e);
    }
    setIsExecutionsLoading(false);
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
        setFormStatus({ type: 'success', msg: 'User updated successfully!' });
        fetchOnlyUsers();
        setTimeout(() => { setIsEditModalOpen(false); resetForm(); }, 1500);
      } else setFormStatus({ type: 'error', msg: data.message });
    } catch (error) { setFormStatus({ type: 'error', msg: 'Error updating user' }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      fetchOnlyUsers();
    } catch (error) { alert('Failed to delete'); }
  };

  const handleClearAll = async () => {
    if (!confirm('CRITICAL WARNING: This will permanently delete ALL clients and their data. Proceed?')) return;
    try {
      await fetch('/api/admin/users?action=clear_all', { method: 'DELETE' });
      fetchOnlyUsers();
    } catch (error) { alert('Failed to clear data'); }
  };

  const handleLoginAs = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to login as ${userName}? Their dashboard will open in a new tab.`)) return;
    
    try {
      const res = await fetch('/api/admin/users/login-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      });
      const data = await res.json();
      
      if (data.success) {
        window.open('/dashboard', '_blank');
      } else {
        alert(data.message || 'Failed to login as client');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', balance: '', role: 'client' });
    setFormStatus({ type: 'idle', msg: '' });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  if (!hasAccess) return null;

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage platform clients, check usage and spent amounts.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button 
            onClick={handleClearAll}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors border border-red-200 shadow-sm w-full sm:w-auto"
          >
            Clear All Clients
          </button>
          <button 
            onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center w-full sm:w-auto hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Add New User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:block">Filter By:</span>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mapped Domain</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mins Used</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Available Mins</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500 font-medium">No users found matching your criteria.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-sm mr-4 shadow-sm border border-blue-200">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                          <p className="text-xs font-medium text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {user.custom_domain ? (
                        <a href={`https://${user.custom_domain}`} target="_blank" className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors inline-flex items-center">
                          {user.custom_domain} <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Not Set</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs font-extrabold border border-orange-100">
                        {Number(user.minutes_used || 0).toLocaleString()} Mins
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-100">
                        ${Number(user.amount_spent || 0).toFixed(4)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-extrabold text-emerald-600 bg-emerald-50 inline-flex px-3 py-1.5 rounded-lg border border-emerald-100">
                        {Number(user.balance).toFixed(0)} <span className="ml-1 text-[10px] font-medium text-emerald-700">Mins Left</span>
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                      <button onClick={() => handleLoginAs(user.id, user.name)} className="flex items-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 shadow-sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg> Login As
                      </button>

                      {/* 🚀 NEW: Call Logs / Executions Button 🚀 */}
                      <button onClick={() => openExecutionsModal(user)} className="text-slate-400 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200" title="View Call Logs & Costs">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </button>

                      <button onClick={() => openEditModal(user)} className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit User">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete User">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 NEW: Executions & Call Logs Modal UI 🚀 */}
      {isExecutionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsExecutionsModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative z-10 animate-fade-in overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Call Logs & Executions</h3>
                <p className="text-sm text-slate-500 font-medium">Viewing real-time cost data for {selectedUser?.name}</p>
              </div>
              <button onClick={() => setIsExecutionsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {isExecutionsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                   <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <p className="text-slate-500 font-medium text-sm">Fetching call logs from Bolna...</p>
                </div>
              ) : executionsData.length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <p className="text-slate-700 font-bold text-lg mb-1">No call records found</p>
                    <p className="text-slate-400 text-sm font-medium">This client hasn't made any calls yet.</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                   {executionsData.map((exec, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md transition-shadow hover:border-purple-200">
                         <div>
                           <div className="flex items-center mb-2">
                             <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${exec.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                               {exec.status}
                             </span>
                             <span className="text-xs font-mono text-slate-400 ml-3">ID: {exec.id.substring(0,12)}...</span>
                           </div>
                           <div className="flex flex-wrap items-center text-sm text-slate-600 font-medium gap-x-4 gap-y-2">
                             <span className="flex items-center bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                               <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
                               {exec.conversation_time || (exec.telephony_data?.duration || 0)} seconds
                             </span>
                             <span className="flex items-center text-slate-500">
                               <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                               {new Date(exec.created_at).toLocaleString()}
                             </span>
                           </div>
                         </div>
                         
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0 w-full md:w-auto">
                           <div className="text-left md:text-right">
                              <p className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider mb-1">Call Cost</p>
                              <p className="text-xl font-black text-purple-600">${Number(exec.total_cost || 0).toFixed(4)}</p>
                           </div>
                           {exec.telephony_data?.recording_url ? (
                             <a href={exec.telephony_data.recording_url} target="_blank" className="flex items-center justify-center px-4 py-2.5 w-full sm:w-auto bg-slate-900 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                               <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                               Play
                             </a>
                           ) : (
                             <span className="text-xs text-slate-400 font-medium px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 w-full sm:w-auto text-center">No Audio</span>
                           )}
                         </div>
                      </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Client Form Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => {setIsCreateModalOpen(false); setIsEditModalOpen(false);}}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-fade-in overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{isEditModalOpen ? 'Edit Client Profile' : 'Add New Client'}</h3>
              <button onClick={() => {setIsCreateModalOpen(false); setIsEditModalOpen(false);}} className="text-slate-400 hover:text-slate-700 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit} className="p-6 space-y-5">
              {formStatus.type === 'error' && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-bold flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formStatus.msg}</div>}
              {formStatus.type === 'success' && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl font-bold flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{formStatus.msg}</div>}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
              </div>
              
              {isEditModalOpen && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Allocated Minutes</label>
                  <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-emerald-600" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{isEditModalOpen ? 'New Password (Leave empty)' : 'Initial Password'}</label>
                <input type="password" required={!isEditModalOpen} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={formStatus.type === 'loading'} className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 flex justify-center items-center">
                  {formStatus.type === 'loading' ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : (isEditModalOpen ? 'Save Changes' : 'Create Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}