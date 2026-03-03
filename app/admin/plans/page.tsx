// app/admin/plans/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function PlansManagement() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const [formData, setFormData] = useState<{name: string, price: string, allocated_credits: string, features: string[]}>({ 
    name: '', price: '', allocated_credits: '', features: [''] 
  });
  const [formStatus, setFormStatus] = useState<{ type: 'idle'|'loading'|'success'|'error', msg: string }>({ type: 'idle', msg: '' });

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

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeatureField = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', msg: '' });
    
    const cleanFeatures = formData.features.filter(f => f.trim() !== '');
    const payload = { ...formData, features: cleanFeatures };

    const method = editingPlan ? 'PUT' : 'POST';
    const body = editingPlan ? { id: editingPlan.id, ...payload } : payload;

    try {
      const res = await fetch('/api/admin/plans', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (data.success) {
        setFormStatus({ type: 'success', msg: data.message });
        fetchPlans();
        setTimeout(() => { setIsModalOpen(false); resetForm(); }, 1500);
      } else {
        setFormStatus({ type: 'error', msg: data.message });
      }
    } catch (error) {
      setFormStatus({ type: 'error', msg: 'Something went wrong.' });
    }
  };

  const openModal = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ 
        name: plan.name, 
        price: plan.price, 
        allocated_credits: plan.allocated_credits,
        features: plan.features && plan.features.length > 0 ? plan.features : ['']
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' });
      fetchPlans();
    } catch (error) {
      alert('Failed to delete plan');
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({ name: '', price: '', allocated_credits: '', features: [''] });
    setFormStatus({ type: 'idle', msg: '' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Subscription Plans</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Create and manage pricing plans and features for your clients.</p>
        </div>
        <button onClick={() => openModal()} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center hover:-translate-y-0.5">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Create New Plan
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-2">
        {isLoading ? (
          <div className="col-span-3 py-20 flex justify-center"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-slate-500 font-medium">No plans created yet. Click above to create one.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(plan)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>

              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
                <span className="text-2xl mr-1 text-slate-400">$</span>{plan.price}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 flex-1">
                <ul className="space-y-3">
                  <li className="flex items-start text-slate-700 text-sm font-bold">
                    <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    {plan.allocated_credits} AI Minutes
                  </li>
                  {plan.features && plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start text-slate-600 text-sm font-medium">
                      <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 animate-fade-in flex flex-col max-h-full">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
              <h3 className="text-lg font-bold text-slate-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="plan-form" onSubmit={handleSubmit} className="space-y-5">
                {formStatus.type === 'error' && <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-bold flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formStatus.msg}</div>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Plan Name</label>
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Growth Plan" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Price ($)</label>
                    <input type="number" step="0.01" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="99.99" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Allocated Minutes</label>
                    <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-emerald-600" value={formData.allocated_credits} onChange={(e) => setFormData({...formData, allocated_credits: e.target.value})} placeholder="1200" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between items-center">
                    Plan Features
                    <button type="button" onClick={addFeatureField} className="text-xs text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-2 py-1 rounded-md">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Add Feature
                    </button>
                  </label>
                  
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-700" 
                          value={feature} 
                          onChange={(e) => handleFeatureChange(index, e.target.value)} 
                          placeholder={`Feature ${index + 1} (e.g. Full Analytics)`} 
                        />
                        {formData.features.length > 1 && (
                          <button type="button" onClick={() => removeFeatureField(index)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 shrink-0">
              <button form="plan-form" type="submit" disabled={formStatus.type === 'loading'} className="w-full bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center">
                {formStatus.type === 'loading' ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : (editingPlan ? 'Save Changes' : 'Publish Plan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}