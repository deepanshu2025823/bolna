// app/admin/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');
  const [adminInitial, setAdminInitial] = useState('A');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'New Client Joined', desc: 'Deepanshu Joshi has registered.', time: '2m ago', unread: true },
    { id: 2, title: 'Wallet Top-up', desc: 'Client added $99.99 to their wallet.', time: '1h ago', unread: true },
    { id: 3, title: 'System Update', desc: 'Bolna API synced successfully.', time: '1d ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.data.admin) {
          const name = data.data.admin.name;
          setAdminName(name);
          setAdminInitial(name.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error('Failed to fetch admin profile');
      }
    };
    fetchAdminProfile();
  }, []);

  const handleLogout = async () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Clients / Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Subscription Plans', href: '/admin/plans', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Margin Tracking', href: '/admin/margins', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#0B1121] border-r border-slate-800/60 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col shadow-2xl lg:shadow-none`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mr-3 shadow-lg shadow-blue-500/20 border border-blue-400/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">AI Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pro</span></span>
        </div>

        <div className="px-4 py-8 flex-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className={`group flex items-center px-3.5 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`} onClick={() => setIsSidebarOpen(false)}>
                  <svg className={`w-5 h-5 mr-3 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 m-4">
          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-4 text-center">
             <p className="text-xs text-blue-200 font-medium mb-3">Need help setting up?</p>
             <button className="w-full text-xs font-bold bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-500 transition-colors">Contact Support</button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        <header className={`sticky top-0 z-20 h-20 transition-all duration-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2.5 rounded-xl mr-3 transition-colors focus:outline-none">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">
              {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
             
             <div className="relative" ref={notifRef}>
               <button 
                  onClick={() => {setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false);}} 
                  className={`text-slate-500 hover:text-blue-600 p-2.5 rounded-full transition-all duration-200 ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100'}`}
               >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm animate-pulse"></span>
                  )}
               </button>

               {isNotifOpen && (
                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in origin-top-right z-50">
                   <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800">Notifications</h3>
                     <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{unreadCount} New</span>
                   </div>
                   <div className="max-h-80 overflow-y-auto">
                     {notifications.map((notif) => (
                       <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-slate-50 cursor-pointer transition-colors ${notif.unread ? 'bg-blue-50/30' : ''}`}>
                         <p className={`text-sm font-semibold ${notif.unread ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</p>
                         <p className="text-xs text-slate-500 mt-1">{notif.desc}</p>
                         <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{notif.time}</p>
                       </div>
                     ))}
                   </div>
                   <div className="px-4 py-2 border-t border-gray-50 text-center">
                     <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Mark all as read</button>
                   </div>
                 </div>
               )}
             </div>
             
             <div className="relative" ref={profileRef}>
               <div 
                 onClick={() => {setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false);}}
                 className="flex items-center cursor-pointer hover:bg-white p-1 pr-3 rounded-full border border-transparent hover:border-gray-200 hover:shadow-sm transition-all duration-200"
               >
                 <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                   {adminInitial}
                 </div>
                 <div className="hidden md:block ml-3">
                   <p className="text-sm font-bold text-slate-700 leading-tight">{adminName}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Master Admin</p>
                 </div>
                 <svg className="hidden md:block w-4 h-4 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                 </svg>
               </div>

               {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in origin-top-right z-50">
                   <div className="px-4 py-3 border-b border-gray-50 mb-1 lg:hidden">
                     <p className="text-sm font-bold text-slate-800">{adminName}</p>
                     <p className="text-xs text-slate-500">admin@portal.com</p>
                   </div>
                   <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                     <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                     Account Settings
                   </Link>
                   <Link href="/admin/users" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                     <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                     Manage Users
                   </Link>
                   <div className="h-px bg-gray-100 my-1"></div>
                   <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                     <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                     Sign Out
                   </button>
                 </div>
               )}
             </div>
             
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
          <div className="absolute top-0 left-1/2 w-full max-w-2xl h-64 bg-blue-100/40 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}