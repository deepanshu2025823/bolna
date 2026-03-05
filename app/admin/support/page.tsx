// app/admin/support/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const fetchAccessAndTickets = async () => {
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

        if (role === 'admin' || permissions.includes('manage_support')) {
          setHasAccess(true);
          const ticketsRes = await fetch('/api/admin/support');
          const ticketsData = await ticketsRes.json();
          if (ticketsData.success) setTickets(ticketsData.data);
        } else {
          router.push('/admin/dashboard');
          return;
        }

      } catch (error) {
        console.error('Failed to fetch data');
      }
      setIsLoading(false);
    };

    fetchAccessAndTickets();
  }, [router]);

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await fetch('/api/admin/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const res = await fetch('/api/admin/support');
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  if (!hasAccess) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Support Inbox</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage and resolve client queries.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
            {tickets.filter(t => t.status === 'open').length} Open
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">No support tickets found.</td></tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className={`hover:bg-slate-50/50 transition-colors ${ticket.status === 'open' ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">#{ticket.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{ticket.client_name}</p>
                      <p className="text-xs text-slate-500">{ticket.client_email}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{ticket.subject}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(ticket.id, ticket.status)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold transition-all hover:opacity-80 ${ticket.status === 'open' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                      >
                        {ticket.status === 'open' ? '🟢 Open (Click to Close)' : '⚫ Closed (Click to Reopen)'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/support/${ticket.id}`} className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">
                        Reply <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </Link>
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