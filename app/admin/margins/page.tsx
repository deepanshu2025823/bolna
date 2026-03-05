// app/admin/margins/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarginTracking() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const fetchAccessAndMargins = async () => {
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

        if (role === 'admin' || permissions.includes('view_margins')) {
          setHasAccess(true);
          
          const res = await fetch('/api/admin/margins');
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        } else {
          router.push('/admin/dashboard');
          return;
        }

      } catch (error) {
        console.error('Failed to verify access or fetch margin data');
      }
      setIsLoading(false);
    };

    fetchAccessAndMargins();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <svg className="animate-spin h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!hasAccess) return null;

  const totalRevenue = data?.totalRevenue || 0;
  const totalBolnaCost = data?.totalBolnaCost || 0;
  const netProfit = data?.netProfit || 0;
  const marginPercentage = data?.marginPercentage || '0.0';
  const clients = data?.clientData || [];

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Margin & Profit <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Tracking</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">Real-time revenue versus backend API execution costs based on actual usage.</p>
        </div>
        
        <div className="relative z-10 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm flex items-center shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Live Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Value Generated</h3>
          <p className="text-3xl font-extrabold text-slate-900">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">From consumed minutes</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-red-50 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-500 mb-1">Backend API Costs</h3>
          <p className="text-3xl font-extrabold text-slate-900">${totalBolnaCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Billed by provider</p>
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
          <p className="text-xs text-slate-400 mt-2 font-medium relative z-10">Clear agency earnings</p>
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
            <h3 className="font-bold text-slate-900 text-[14px] md:text-xl">Client User Base</h3>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium mt-0.5">List of clients and their available wallet balances</p>
          </div>
          <button className="text-[10px] md:text-sm bg-white border border-gray-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Available Minutes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No client data available.</td></tr>
              ) : (
                clients.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {Math.floor(Number(user.balance) || 0)} Mins
                      </span>
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