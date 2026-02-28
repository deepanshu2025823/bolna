// app/admin/plans/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function PlansManagement() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const [editData, setEditData] = useState({ price: '', allocated_credits: '' });
  const [updateStatus, setUpdateStatus] = useState<{ type: 'idle'|'loading'|'success'|'error', msg: string }>({ type: 'idle', msg: '' });

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (error) {
      console.error('Failed to fetch plans');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setEditData({ price: plan.price, allocated_credits: plan.allocated_credits });
    setUpdateStatus({ type: 'idle', msg: '' });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus({ type: 'loading', msg: '' });

    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPlan.id,
          price: parseFloat(editData.price),
          allocated_credits: parseInt(editData.allocated_credits, 10)
        }),
      });
      const data = await res.json();

      if (data.success) {
        setUpdateStatus({ type: 'success', msg: 'Plan updated!' });
        fetchPlans();
        setTimeout(() => setEditingPlan(null), 1500);
      } else {
        setUpdateStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setUpdateStatus({ type: 'error', msg: 'Something went wrong.' });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Subscription Plans</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Control the pricing and allocated credits for your clients to manage margins.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              
              {plan.name === 'Premium' && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name} Plan</h3>
                <div className="flex items-baseline text-slate-900">
                  <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-slate-500 font-medium">/ purchase</span>
                </div>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-600 font-medium">
                    <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Allocated Credits: <span className="ml-2 font-bold text-slate-900">{plan.allocated_credits}</span>
                  </li>
                  <li className="flex items-center text-slate-600 font-medium">
                    <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Full Dashboard Access
                  </li>
                  <li className="flex items-center text-slate-600 font-medium">
                    <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Live Sync with Bolna
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => openEditModal(plan)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  plan.name === 'Premium' 
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Edit Configuration
              </button>
            </div>
          ))}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditingPlan(null)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-fade-in">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Edit {editingPlan.name} Plan</h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              {updateStatus.type === 'error' && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{updateStatus.msg}</div>}
              {updateStatus.type === 'success' && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl font-medium">{updateStatus.msg}</div>}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selling Price ($)</label>
                <input 
                  type="number" step="0.01" required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={editData.price} 
                  onChange={(e) => setEditData({...editData, price: e.target.value})} 
                />
                <p className="text-xs text-slate-500 mt-1.5">This is the amount your client will pay you.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Allocated Credits</label>
                <input 
                  type="number" required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={editData.allocated_credits} 
                  onChange={(e) => setEditData({...editData, allocated_credits: e.target.value})} 
                />
                <p className="text-xs text-slate-500 mt-1.5">Credits added to client's wallet upon purchase.</p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={updateStatus.type === 'loading'} 
                  className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {updateStatus.type === 'loading' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}