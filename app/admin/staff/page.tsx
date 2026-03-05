// app/admin/staff/page.tsx
'use client';

import { useState, useEffect } from 'react';

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_users', label: 'Clients / Users Management' },
  { id: 'manage_plans', label: 'Subscription Plans' },
  { id: 'manage_billing', label: 'Billing & Payments' },
  { id: 'manage_support', label: 'Support Inbox' },
  { id: 'view_margins', label: 'Margin Tracking' },
  { id: 'manage_settings', label: 'Platform Settings' },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  const [formData, setFormData] = useState<{name: string, email: string, password: string, designation: string, permissions: string[]}>({ 
    name: '', email: '', password: '', designation: 'Support Agent', permissions: [] 
  });
  const [customDesignation, setCustomDesignation] = useState('');
  
  const [formStatus, setFormStatus] = useState<{ type: 'idle'|'loading'|'success'|'error', msg: string }>({ type: 'idle', msg: '' });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success) setStaff(data.data);
    } catch (error) {
      console.error('Failed to fetch staff');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handlePermissionToggle = (permissionId: string) => {
    const currentPermissions = formData.permissions;
    if (currentPermissions.includes(permissionId)) {
      setFormData({ ...formData, permissions: currentPermissions.filter(p => p !== permissionId) });
    } else {
      setFormData({ ...formData, permissions: [...currentPermissions, permissionId] });
    }
  };

  const handleSelectAllPermissions = () => {
    if (formData.permissions.length === AVAILABLE_PERMISSIONS.length) {
      setFormData({ ...formData, permissions: [] }); // Deselect all
    } else {
      setFormData({ ...formData, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) }); // Select all
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', msg: '' });
    
    const finalDesignation = formData.designation === 'custom' ? customDesignation : formData.designation;

    if (formData.designation === 'custom' && !customDesignation.trim()) {
      setFormStatus({ type: 'error', msg: 'Please enter a custom designation' });
      return;
    }

    const method = editingStaff ? 'PUT' : 'POST';
    const body = editingStaff 
      ? { id: editingStaff.id, ...formData, designation: finalDesignation } 
      : { ...formData, designation: finalDesignation };

    try {
      const res = await fetch('/api/admin/staff', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (data.success) {
        setFormStatus({ type: 'success', msg: data.message });
        fetchStaff();
        setTimeout(() => { setIsModalOpen(false); resetForm(); }, 1500);
      } else setFormStatus({ type: 'error', msg: data.message });
    } catch (error) { setFormStatus({ type: 'error', msg: 'Something went wrong.' }); }
  };

  const openModal = (staffMember: any = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      
      const defaultRoles = ['Support Agent', 'Technical Manager', 'Billing Specialist', 'Super Admin'];
      const isDefault = defaultRoles.includes(staffMember.designation);
      
      setFormData({ 
        name: staffMember.name, 
        email: staffMember.email, 
        password: '', 
        designation: isDefault ? staffMember.designation : 'custom',
        permissions: staffMember.permissions || [] 
      });
      setCustomDesignation(isDefault ? '' : staffMember.designation);
      
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this staff member? This action cannot be undone.')) return;
    try {
      await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      fetchStaff();
    } catch (error) { alert('Failed to delete'); }
  };

  const handleLoginAs = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to login as ${userName}?`)) return;
    
    try {
      const res = await fetch('/api/admin/users/login-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      });
      const data = await res.json();
      
      if (data.success) {
        const urlName = userName.replace(/\s+/g, '_').toLowerCase();
        window.open(`/admin/dashboard?secret_login=${urlName}`, '_blank');
      } else {
        alert(data.message || 'Failed to login as staff');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
  };

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', designation: 'Support Agent', permissions: [] });
    setCustomDesignation('');
    setFormStatus({ type: 'idle', msg: '' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.designation && member.designation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Team Management</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Add staff members, assign roles, and set custom permissions.</p>
        </div>
        <button onClick={() => openModal()} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center hover:-translate-y-0.5">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search team by name, email or role..." 
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-wider">{filteredStaff.length} Members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Access Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center"><svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-500 font-medium">No staff members found matching your search.</td></tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-sm mr-4 shadow-sm border border-indigo-200">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</p>
                          <p className="text-xs font-medium text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        {member.designation || 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.permissions && member.permissions.length === AVAILABLE_PERMISSIONS.length ? (
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Full Access</span>
                      ) : member.permissions && member.permissions.length > 0 ? (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{member.permissions.length} Modules</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">No Access</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleLoginAs(member.id, member.name)}
                        title="Login as this staff member"
                        className="flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 shadow-sm"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        Login As
                      </button>
                      <button onClick={() => openModal(member)} className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
              <h3 className="text-lg font-bold text-slate-900">{editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}</h3>
              <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
                {formStatus.type === 'error' && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-bold flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formStatus.msg}</div>}
                
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Designation / Role</label>
                    <select 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer font-medium text-slate-700" 
                      value={formData.designation} 
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    >
                      <option value="Support Agent">Support Agent</option>
                      <option value="Technical Manager">Technical Manager</option>
                      <option value="Billing Specialist">Billing Specialist</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="custom" className="font-bold text-blue-600">+ Add Custom Designation</option>
                    </select>
                  </div>

                  {formData.designation === 'custom' && (
                    <div className="animate-fade-in -mt-2">
                      <label className="block text-xs font-bold text-blue-600 mb-1.5">Type Custom Designation</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900" 
                        value={customDesignation} 
                        onChange={(e) => setCustomDesignation(e.target.value)} 
                        placeholder="e.g. Marketing Head" 
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{editingStaff ? 'New Password (Optional)' : 'Initial Password'}</label>
                    <input type="password" required={!editingStaff} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3 mt-2">
                      <label className="block text-sm font-bold text-slate-900">Module Access Permissions</label>
                      <button type="button" onClick={handleSelectAllPermissions} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                        {formData.permissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AVAILABLE_PERMISSIONS.map((perm) => (
                          <label key={perm.id} className="flex items-center space-x-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.permissions.includes(perm.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                              {formData.permissions.includes(perm.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={formData.permissions.includes(perm.id)} 
                              onChange={() => handlePermissionToggle(perm.id)} 
                            />
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0">
              <button form="staff-form" type="submit" disabled={formStatus.type === 'loading'} className="w-full bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center">
                {formStatus.type === 'loading' ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : (editingStaff ? 'Save Changes' : 'Create Staff Member')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}