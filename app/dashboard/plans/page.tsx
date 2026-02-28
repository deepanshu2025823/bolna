// app/dashboard/plans/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ClientPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans');
        const data = await res.json();
        if (data.success) setPlans(data.data);
      } catch (error) {
        console.error('Failed to fetch plans');
      }
      setIsLoading(false);
    };
    fetchPlans();
  }, []);

  const handlePurchase = async (planId: number) => {
    setPurchasingId(planId);
    setMessage('');
    
    try {
      const res = await fetch('/api/user/buy-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(data.message);
        setTimeout(() => window.location.href = '/dashboard', 2000);
      } else {
        setMessage(data.message || 'Transaction failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
    setPurchasingId(null);
  };

  return (
    <div className="space-y-8 font-sans">
      
      <div className="text-center max-w-2xl mx-auto mt-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Add Funds & Credits</h2>
        <p className="text-slate-500 text-lg">Choose a plan to instantly add credits to your wallet. These credits will be used for your AI voice agent executions.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-center font-bold max-w-md mx-auto animate-fade-in ${message.includes('Success') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 relative">
              {plan.name === 'Growth' && (
                 <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                   Most Popular
                 </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline text-slate-900">
                  <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-slate-500 font-medium">/ purchase</span>
                </div>
              </div>

              <div className="flex-1 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Credits Added</span>
                  <span className="text-xl font-bold text-blue-600">{plan.allocated_credits}</span>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex items-center text-slate-600 font-medium text-sm">
                    <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Full Performance Analytics
                  </li>
                  <li className="flex items-center text-slate-600 font-medium text-sm">
                    <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Access to Call Recordings
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => handlePurchase(plan.id)}
                disabled={purchasingId !== null}
                className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all duration-200 flex justify-center items-center ${
                  plan.name === 'Growth' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                } disabled:opacity-50`}
              >
                {purchasingId === plan.id ? (
                   <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Pay Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}