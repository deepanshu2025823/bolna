// app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data');
      }
      setIsLoading(false);
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  const stats = [
    { 
      title: 'Total Active Clients', 
      value: data?.totalClients || '0', 
      trend: 'Live from DB', 
      isUp: true,
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      bgColor: 'bg-blue-50',
    },
    { 
      title: 'Total Executions', 
      value: data?.totalExecutions.toLocaleString() || '0', 
      trend: 'Syncing', 
      isUp: true,
      icon: <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      bgColor: 'bg-purple-50',
    },
    { 
      title: 'Total AI Minutes', 
      value: data?.totalAIMinutes.toLocaleString() || '0', 
      trend: 'Calculated', 
      isUp: true,
      icon: <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      bgColor: 'bg-amber-50',
    },
    { 
      title: 'Est. Margin Profit', 
      value: `$${data?.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`, 
      trend: 'Real-time', 
      isUp: true,
      icon: <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Admin 👋</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">Here is the live performance of your AI portal today.</p>
        </div>
        <div className="w-full sm:w-auto relative z-10 mt-2 sm:mt-0">
          <Link href="/admin/users" className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 flex items-center justify-center transform hover:-translate-y-0.5">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add New Client
          </Link>
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bgColor} transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">{stat.title}</h3>
              <p className="text-3xl font-extrabold text-slate-900 mb-3">{stat.value}</p>
              <div className="flex items-center text-sm">
                <div className={`flex items-center px-2 py-1 rounded-md ${stat.isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <span className="font-bold text-xs">{stat.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Dynamic Activity Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recent Client Signups</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Latest users added to the portal</p>
          </div>
          <Link href="/admin/users" className="text-sm bg-white border border-gray-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            View All Clients
          </Link>
        </div>
        
        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Client Details</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Wallet Balance</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentActivity.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs font-medium text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-emerald-600">${Number(user.balance).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">No clients found</h4>
            <p className="text-slate-500 text-sm font-medium">Start adding clients to see activity here.</p>
          </div>
        )}
      </div>

    </div>
  );
}