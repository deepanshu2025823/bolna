// app/dashboard/numbers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PhoneNumbers() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNumbers = async () => {
      try {
        const res = await fetch('/api/user/numbers');
        const data = await res.json();
        if (data.success) {
          setNumbers(data.data);
        }
      } catch (error) {
        console.error('Failed to load numbers');
      }
      setIsLoading(false);
    };
    fetchNumbers();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Phone Numbers</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage the virtual phone numbers assigned to your AI agents.</p>
        </div>
        <Link href="/dashboard/support" className="bg-white border border-gray-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center">
          <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Request New Number
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Active Numbers ({numbers.length})</h3>
        </div>
        
        {numbers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">No phone numbers assigned</h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">You currently don't have any virtual numbers attached to your account.</p>
            <Link href="/dashboard/support" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">Contact Support to get a number</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capability</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Agent</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {numbers.map((num) => (
                  <tr key={num.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <span className="font-extrabold text-slate-900 text-lg tracking-wide">{num.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{num.type}</td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{num.agent}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {num.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500 font-medium">
                      {new Date(num.purchased_on).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}