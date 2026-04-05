// app/dashboard/agents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentsManagement() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ agent_name: '', welcome_message: '', prompt: '' });
  const [formStatus, setFormStatus] = useState<{ type: 'idle'|'loading'|'success'|'error', msg: string }>({ type: 'idle', msg: '' });

  const router = useRouter();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch agents');
    }
    setIsLoading(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', msg: '' });
    try {
      const res = await fetch('/api/user/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setFormStatus({ type: 'success', msg: 'Agent created successfully!' });
        fetchAgents();
        setTimeout(() => { 
            setIsCreateModalOpen(false); 
            setFormData({ agent_name: '', welcome_message: '', prompt: '' });
            setFormStatus({ type: 'idle', msg: '' });
        }, 1500);
      } else {
        setFormStatus({ type: 'error', msg: data.message || 'Failed to create agent' });
      }
    } catch (error) {
      setFormStatus({ type: 'error', msg: 'Something went wrong.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Agent?')) return;
    try {
      await fetch(`/api/user/agents?id=${id}`, { method: 'DELETE' });
      fetchAgents();
    } catch (error) {
      alert('Failed to delete agent');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AI Agents</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Create and manage your AI voice agents and their behaviors.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center w-full sm:w-auto justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Build New Agent
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center"><svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></td></tr>
              ) : agents.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-500 font-medium">You haven't created any agents yet.</td></tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-sm mr-4 shadow-sm border border-indigo-200">
                          🤖
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{agent.agent_name || 'Unnamed Agent'}</p>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {agent.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 uppercase tracking-wide">
                        {agent.agent_status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(agent.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete Agent">
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 animate-fade-in overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Build New AI Agent</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              {formStatus.type === 'error' && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-bold">{formStatus.msg}</div>}
              {formStatus.type === 'success' && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl font-bold">{formStatus.msg}</div>}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Agent Name</label>
                <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.agent_name} onChange={(e) => setFormData({...formData, agent_name: e.target.value})} placeholder="e.g. Sales Bot, Alfred" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Welcome Message</label>
                <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.welcome_message} onChange={(e) => setFormData({...formData, welcome_message: e.target.value})} placeholder="e.g. Hello! How can I help you today?" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">System Prompt (Instructions)</label>
                <textarea required rows={4} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" value={formData.prompt} onChange={(e) => setFormData({...formData, prompt: e.target.value})} placeholder="You are a helpful assistant for our clinic. Your goal is to book appointments..."></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={formStatus.type === 'loading'} className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-70 flex justify-center items-center">
                  {formStatus.type === 'loading' ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}