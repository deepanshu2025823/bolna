// app/dashboard/numbers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PhoneNumbers() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const filteredNumbers = numbers.filter(num => 
    num.phone.toLowerCase().includes(searchTerm.toLowerCase()) || 
    num.agent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNumbers.length / itemsPerPage) || 1;
  if (currentPage > totalPages) setCurrentPage(1);
  const currentNumbers = filteredNumbers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans">
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
        <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h3 className="font-bold text-slate-900 whitespace-nowrap">Active Numbers ({numbers.length})</h3>
          
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by number or agent..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
          </div>
        </div>
        
        {filteredNumbers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">
              {searchTerm ? 'No matching numbers found' : 'No phone numbers assigned'}
            </h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              {searchTerm ? 'Try adjusting your search criteria.' : "You currently don't have any virtual numbers attached to your account."}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/support" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">Contact Support to get a number</Link>
            )}
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
                {currentNumbers.map((num) => (
                  <tr key={num.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm border border-blue-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
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

        {filteredNumbers.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-3">
            <p>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNumbers.length)} of {filteredNumbers.length} number(s)</p>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg bg-blue-50 text-blue-600 font-bold">
                {currentPage}
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}