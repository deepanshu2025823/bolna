// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/user/dashboard');
      const json = await res.json();
      if (json.success) {
        setDashboardData(json.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data');
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const hasBalance = dashboardData?.hasBalance;
  const metrics = dashboardData?.metrics;
  const logs = dashboardData?.logs || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Agent Conversations</h2>
          <p className="text-sm text-slate-500 mt-1">Displays all historical conversations with your agents synced from Bolna.</p>
        </div>
        <div className="hidden sm:flex space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || !hasBalance}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm flex items-center hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <svg className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {isRefreshing ? 'Syncing Logs...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {!hasBalance ? (
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
           <svg className="w-16 h-16 text-red-100 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
           </svg>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Insufficient Minutes</h3>
           <p className="text-slate-500 mb-6 max-w-md mx-auto">Your available balance is 0 Minutes. You need active minutes to execute calls and view performance metrics. Please purchase a plan to continue.</p>
           <Link href="/dashboard/plans" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
             View Subscription Plans
             <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
           </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center text-slate-900 font-bold text-lg mb-4">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Performance Metrics
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-slate-500">Total Executions</p>
                <div className="bg-blue-50 p-1.5 rounded-lg"><svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{metrics?.totalExecutions || 0}</p>
              <p className="text-xs text-slate-400 mt-1">All call attempts</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-slate-500">Minutes Used</p>
                <div className="bg-indigo-50 p-1.5 rounded-lg"><svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{metrics?.totalDuration ? Math.ceil(metrics.totalDuration / 60) : 0} Mins</p>
              <p className="text-xs text-slate-400 mt-1">Total campaign time deducted</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-slate-500">Avg Duration/Call</p>
                <div className="bg-purple-50 p-1.5 rounded-lg"><svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{metrics?.avgDuration ? (metrics.avgDuration).toFixed(1) : '0.0'}s</p>
              <p className="text-xs text-slate-400 mt-1">Average call length</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-100 transition-colors">
              <p className="text-sm font-semibold text-slate-500 mb-3">Status Breakdown</p>
              <div className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-100">
                Completed Calls
                <span className="ml-2 text-emerald-600 bg-white px-2.5 py-0.5 rounded-lg shadow-sm border border-emerald-100">{metrics?.completedCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Recent Call Logs</h3>
              <input type="text" placeholder="Search logs..." className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white shadow-sm" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Agent & ID</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Recording</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.length === 0 ? (
                     <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                           <p className="text-slate-500 font-bold">No call logs found yet.</p>
                        </td>
                     </tr>
                  ) : (
                    logs.map((log: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{log.agent_name}</p>
                          <p className="font-mono text-[10px] text-slate-400 mt-0.5">ID: {log.id.substring(0, 8)}...</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{log.phone}</td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{log.type}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{log.duration}s <span className="text-xs font-medium text-slate-400 block mt-0.5">({(log.duration / 60).toFixed(2)} Mins)</span></td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">{log.time}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${log.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {log.recording_url ? (
                            <a href={log.recording_url} target="_blank" className="flex items-center w-max px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-all border border-blue-100">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                              Play Audio
                            </a>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 italic">No recording</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}