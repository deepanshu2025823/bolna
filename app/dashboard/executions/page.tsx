// app/dashboard/executions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CallExecutions() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  if (!hasBalance) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-12 text-center relative overflow-hidden max-w-3xl mx-auto mt-10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Feature Locked</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-base">Your wallet balance is $0.00. Detailed call logs, recordings, and transcripts are only available for accounts with active credits.</p>
        <Link href="/dashboard/plans" className="inline-flex items-center px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
          Top Up Wallet Now
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </div>
    );
  }

  const logs = [
    { id: 'd6481f9a', phone: '+91 62025 73697', type: 'vobiz outbound', duration: 29, time: '28 Feb 26, 15:05', cost: '$0.083', status: 'Completed' },
    { id: 'c9161a2b', phone: '+91 62025 73697', type: 'vobiz outbound', duration: 42, time: '28 Feb 26, 03:45', cost: '$0.124', status: 'Completed' },
    { id: 'a1b2c3d4', phone: '+1 415 555 2671', type: 'sales inbound', duration: 156, time: '27 Feb 26, 11:20', cost: '$0.450', status: 'Completed' },
    { id: 'e5f6g7h8', phone: '+44 7700 900077', type: 'support call', duration: 12, time: '27 Feb 26, 09:15', cost: '$0.035', status: 'Failed' },
    { id: 'i9j0k1l2', phone: '+91 98765 43210', type: 'vobiz outbound', duration: 88, time: '26 Feb 26, 16:30', cost: '$0.250', status: 'Completed' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Call Executions</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Detailed logs of all your AI voice agent conversations synced from Bolna.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by Execution ID or Phone..." 
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer text-slate-700 w-full sm:w-auto">
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Failed</option>
            </select>
            <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer text-slate-700 w-full sm:w-auto">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 uppercase tracking-wider text-xs">Execution ID</th>
                <th className="px-6 py-4 uppercase tracking-wider text-xs">User Number</th>
                <th className="px-6 py-4 uppercase tracking-wider text-xs">Type</th>
                <th className="px-6 py-4 uppercase tracking-wider text-xs">Duration</th>
                <th className="px-6 py-4 uppercase tracking-wider text-xs">Timestamp</th>
                <th className="px-6 py-4 uppercase tracking-wider text-xs">Cost</th>
                <th className="px-6 py-4 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.filter(log => log.id.includes(searchTerm) || log.phone.includes(searchTerm)).map((log, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-700 font-medium flex items-center">
                    {log.id}
                    <button className="ml-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{log.phone}</td>
                  <td className="px-6 py-4 text-slate-600">{log.type}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{log.duration}s</td>
                  <td className="px-6 py-4 text-slate-500 text-xs leading-relaxed">{log.time}</td>
                  <td className="px-6 py-4 text-slate-900 font-bold">{log.cost}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${log.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex w-full flex-col items-center bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white transition-all group/btn border border-blue-100 hover:border-blue-600 shadow-sm">
                      <span className="font-bold flex items-center text-xs">
                        Recordings 
                        <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </span>
                      <span className="text-[10px] text-blue-500 group-hover/btn:text-blue-200 mt-0.5">& Transcripts</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-slate-500">
          <p>Showing 1 to 5 of 68 executions</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-blue-50 text-blue-600 font-bold">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}