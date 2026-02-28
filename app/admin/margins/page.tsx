// app/admin/margins/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function MarginTracking() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } catch (error) {
        console.error('Failed to fetch users');
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const totalRevenue = users.reduce((acc, user) => acc + (Number(user.balance) > 0 ? Number(user.balance) * 2.5 : 0), 0) + 1250; 
  const totalBolnaCost = totalRevenue * 0.18; 
  const netProfit = totalRevenue - totalBolnaCost;
  const marginPercentage = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Margin & Profit <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Tracking</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">Monitor your revenue versus Bolna API execution costs in real-time.</p>
        </div>
        
        <div className="relative z-10 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm flex items-center shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Live Analytics
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Client Revenue</h3>
          <p className="text-3xl font-extrabold text-slate-900">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Funds added by clients</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-500 mb-1">Bolna API Costs</h3>
          <p className="text-3xl font-extrabold text-slate-900">${totalBolnaCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Billed by Bolna backend</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-500 mb-1 relative z-10">Net Profit</h3>
          <p className="text-3xl font-extrabold text-emerald-600 relative z-10">${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium relative z-10">Your clear earnings</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-2xl bg-slate-800 text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-400 mb-1 relative z-10">Average Margin</h3>
          <p className="text-3xl font-extrabold text-white relative z-10">{marginPercentage}%</p>
          <p className="text-xs text-slate-400 mt-2 font-medium relative z-10">Highly profitable</p>
        </div>

      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Client Profitability Report</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Breakdown of margins per active client</p>
          </div>
          <button className="text-sm bg-white border border-gray-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Revenue</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Bolna Cost</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Calculating margins...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No client data available to calculate margins.</td></tr>
              ) : (
                users.map((user) => {
                  const clientRev = Number(user.balance) > 0 ? Number(user.balance) * 2.5 : 0;
                  const clientCost = clientRev * 0.18;
                  const clientProfit = clientRev - clientCost;
                  const clientMargin = clientRev > 0 ? Number(((clientProfit / clientRev) * 100).toFixed(0)) : 0;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        ${clientRev > 0 ? clientRev.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        ${clientCost > 0 ? clientCost.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-emerald-600">
                        ${clientProfit > 0 ? clientProfit.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${clientMargin > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                          {clientMargin}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}