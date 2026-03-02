// app/admin/staff/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', designation: 'Support Agent' });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', msg: '' });
    
    const method = editingStaff ? 'PUT' : 'POST';
    const body = editingStaff ? { id: editingStaff.id, ...formData } : formData;

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
      setFormData({ name: staffMember.name, email: staffMember.email, password: '', designation: staffMember.designation });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      fetchStaff();
    } catch (error) { alert('Failed to delete'); }
  };

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', designation: 'Support Agent' });
    setFormStatus({ type: 'idle', msg: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Team Management</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Add staff members and assign designations to handle support tickets.</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Loading team members...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No staff members found. Click "Add New Staff" to build your team.</td></tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{member.name}</p>
                          <p className="text-xs font-medium text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        {member.designation || 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(member)} className="text-slate-400 hover:text-blue-600 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-600 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formStatus.type === 'error' && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{formStatus.msg}</div>}
              {formStatus.type === 'success' && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl font-medium">{formStatus.msg}</div>}

              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label><input type="text" required className="w-full px-4 py-2 border rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label><input type="email" required className="w-full px-4 py-2 border rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
                <select required className="w-full px-4 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})}>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Technical Manager">Technical Manager</option>
                  <option value="Billing Specialist">Billing Specialist</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{editingStaff ? 'New Password (Optional)' : 'Initial Password'}</label>
                <input type="password" required={!editingStaff} className="w-full px-4 py-2 border rounded-xl" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <button type="submit" disabled={formStatus.type === 'loading'} className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl mt-4 hover:bg-slate-800">
                {formStatus.type === 'loading' ? 'Processing...' : (editingStaff ? 'Save Changes' : 'Add Staff Member')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}