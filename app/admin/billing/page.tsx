// app/admin/billing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingManagement() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [hasAccess, setHasAccess] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const fetchAccessAndBilling = async () => {
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

        if (role === 'admin' || permissions.includes('manage_billing')) {
          setHasAccess(true);
          
          const res = await fetch('/api/admin/billing');
          const data = await res.json();
          if (data.success) {
            setTransactions(data.data);
          }
        } else {
          router.push('/admin/dashboard');
          return;
        }

      } catch (error) {
        console.error('Failed to verify access or load billing records');
      }
      setIsLoading(false);
    };

    fetchAccessAndBilling();
  }, [router]);

  const handleClearAll = async () => {
    if (!confirm('CRITICAL WARNING: This will permanently delete ALL billing and transaction history. Proceed?')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/billing', { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setTransactions([]); 
        alert('All billing records have been cleared.');
      } else {
        alert(data.message || 'Failed to clear data');
      }
    } catch (error) {
      alert('Something went wrong.');
    }
    setIsLoading(false);
  };

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.status === filter);

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  if (!hasAccess) return null;

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Billing & Subscriptions</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Track client payments, failed transactions, and subscription statuses.</p>
        </div>
        
        <button 
          onClick={handleClearAll}
          className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors border border-red-200 shadow-sm"
        >
          Clear All Records
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
          All Transactions
        </button>
        <button onClick={() => setFilter('success')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'success' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
          Successful
        </button>
        <button onClick={() => setFilter('pending')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
          Pending
        </button>
        <button onClick={() => setFilter('failed')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'failed' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
          Failed Attempts
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan & Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500 font-medium">No billing records found for this filter.</td></tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {tx.razorpay_payment_id || tx.razorpay_order_id || `TXN-${tx.id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{tx.user_name}</p>
                      <p className="text-xs font-medium text-slate-500">{tx.user_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-extrabold text-slate-800">${Number(tx.amount).toFixed(2)}</p>
                      <p className="text-xs font-semibold text-blue-600">{tx.plan_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === 'success' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">Success</span>}
                      {tx.status === 'pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">Pending</span>}
                      {tx.status === 'failed' && (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100 mb-1">Failed</span>
                          <p className="text-[10px] text-red-500 max-w-[150px] leading-tight font-medium">{tx.failure_reason}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}