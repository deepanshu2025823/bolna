// app/admin/support/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const formatMessage = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function AdminTicketChat() {
  const { id } = useParams();
  const router = useRouter();
  
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    try {
      const res = await fetch(`/api/admin/support/${id}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.data.ticket);
        setMessages(data.data.messages);
      } else {
        router.push('/admin/support');
      }
    } catch (error) {
      console.error('Failed to load chat');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      const data = await res.json();
      
      if (data.success) {
        setNewMessage('');
        fetchChat(); 
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sending message');
    }
    setIsSending(false);
  };

  const toggleStatus = async () => {
    const newStatus = ticket?.status === 'open' ? 'closed' : 'open';
    try {
      await fetch('/api/admin/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket?.id, status: newStatus })
      });
      fetchChat();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in max-w-5xl mx-auto">
      
      <div className="bg-white rounded-t-3xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 relative gap-4">
        <div className="flex items-center">
          <Link href="/admin/support" className="p-2 mr-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {ticket?.subject}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Ticket #{ticket?.id} • Client: <span className="font-bold text-slate-700">{ticket?.client_name}</span></p>
          </div>
        </div>
        <div>
          <button onClick={toggleStatus} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${ticket?.status === 'open' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
            {ticket?.status === 'open' ? 'Close Ticket' : 'Reopen Ticket'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 border-x border-gray-100 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isAdmin = msg.sender_role !== 'client';
          
          return (
            <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-fade-in`}>
              {!isAdmin && (
                <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">{msg.sender_name} (Client)</span>
              )}
              {isAdmin && (
                <span className="text-[10px] font-bold text-slate-400 mb-1 mr-1 uppercase">You ({msg.sender_name})</span>
              )}
              <div 
                className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl shadow-sm whitespace-pre-wrap text-sm ${
                  isAdmin 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-slate-700 rounded-tl-none'
                }`}
              >
                {formatMessage(msg.message)}
              </div>
              <span className={`text-[10px] text-slate-400 mt-1 font-medium ${isAdmin ? 'mr-1' : 'ml-1'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white rounded-b-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border border-gray-100 p-4 relative z-10">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1 bg-slate-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all overflow-hidden relative">
            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder={ticket?.status === 'closed' ? "This ticket is closed. Reopen to reply." : "Reply to client... (Press Enter to send)"}
              disabled={ticket?.status === 'closed'}
              className="w-full bg-transparent px-4 py-3.5 text-sm outline-none resize-none max-h-32 min-h-[50px] custom-scrollbar disabled:opacity-50"
              rows={1}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSending || !newMessage.trim() || ticket?.status === 'closed'} 
            className="bg-blue-600 text-white h-12 w-12 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-5 h-5 ml-1 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
          </button>
        </form>
      </div>

    </div>
  );
}