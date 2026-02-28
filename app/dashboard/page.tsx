// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success) setProfile(data.data);
      } catch (error) {
        console.error('Failed to load profile');
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const hasBalance = profile && Number(profile.balance) > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Agent Conversations</h2>
          <p className="text-sm text-slate-500 mt-1">Displays all historical conversations with agents synced from Bolna.</p>
        </div>
        <div className="hidden sm:flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm flex items-center hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>
      </div>

      {!hasBalance ? (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
           <svg className="w-16 h-16 text-red-100 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
           </svg>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Insufficient Credits</h3>
           <p className="text-slate-500 mb-6 max-w-md mx-auto">Your wallet balance is $0.00. You need active credits to execute calls and view performance metrics. Please purchase a plan to continue.</p>
           <Link href="/dashboard/plans" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
             View Subscription Plans
             <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
           </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center text-slate-900 font-bold text-lg mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Performance Metrics
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-slate-500">Total Executions</p>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">68</p>
              <p className="text-xs text-slate-400 mt-1">All call attempts</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-slate-500">Total Cost</p>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">$15.21</p>
              <p className="text-xs text-slate-400 mt-1">Total campaign spend</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-slate-500">Total Duration</p>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">5927.0s</p>
              <p className="text-xs text-slate-400 mt-1">Total call time</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-slate-500 mb-3">Status Breakdown</p>
              <div className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100">
                Completed <span className="ml-2 text-emerald-500 bg-white px-2 rounded-md shadow-sm">68</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-slate-500 mb-2">Avg Cost</p>
              <p className="text-3xl font-extrabold text-slate-900">$0.22</p>
              <p className="text-xs text-slate-400 mt-1">Average cost per call</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold text-slate-500">Avg Duration</p>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">87.2s</p>
              <p className="text-xs text-slate-400 mt-1">Average call length</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <input type="text" placeholder="Search by execution id" className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-slate-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Execution ID</th>
                    <th className="px-4 py-3">User Number</th>
                    <th className="px-4 py-3">Conversation Type</th>
                    <th className="px-4 py-3">Duration (s)</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Conversation Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600 flex items-center">
                      d6481...
                      <svg className="w-3.5 h-3.5 ml-2 text-slate-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </td>
                    <td className="px-4 py-3 text-slate-600">+916202573697</td>
                    <td className="px-4 py-3 text-slate-600">vobiz outbound</td>
                    <td className="px-4 py-3 text-slate-600">29</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">28 Feb 26, 15:05<br/>(+05:30)</td>
                    <td className="px-4 py-3 text-slate-600">$0.083</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold border border-emerald-100">Completed</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex flex-col items-start bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors group">
                        <span className="font-bold flex items-center">Recordings <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></span>
                        <span className="text-xs text-blue-500">transcripts, etc</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600 flex items-center">
                      c9161...
                      <svg className="w-3.5 h-3.5 ml-2 text-slate-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </td>
                    <td className="px-4 py-3 text-slate-600">+916202573697</td>
                    <td className="px-4 py-3 text-slate-600">vobiz outbound</td>
                    <td className="px-4 py-3 text-slate-600">42</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">28 Feb 26, 03:45<br/>(+05:30)</td>
                    <td className="px-4 py-3 text-slate-600">$0.124</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold border border-emerald-100">Completed</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex flex-col items-start bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors group">
                        <span className="font-bold flex items-center">Recordings <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></span>
                        <span className="text-xs text-blue-500">transcripts, etc</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}