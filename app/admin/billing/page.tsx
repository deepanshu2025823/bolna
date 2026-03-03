// app/admin/billing/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function BillingManagement() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch('/api/admin/billing');
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch billing records');
      }
      setIsLoading(false);
    };
    fetchBilling();
  }, []);

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Billing & Subscriptions</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Track client payments, failed transactions, and subscription statuses.</p>
        </div>
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
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center"><svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></td></tr>
              ) : filteredTransactions.length === 0 ? (
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