// app/dashboard/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [portalName, setPortalName] = useState('HIGHVANCE');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'Welcome to AI Portal', desc: 'Your account is ready. Setup your first agent!', time: '2h ago', unread: true },
    { id: 2, title: 'Support Ticket Update', desc: 'Admin replied to your ticket #1.', time: '1d ago', unread: true },
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
    const fetchProfileAndSettings = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        
        if (data.success) {
          setUserProfile(data.data);
        } else {
          router.push('/login');
        }

        const settingsRes = await fetch('/api/admin/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data.settings?.portal_name) {
          setPortalName(settingsData.data.settings.portal_name);
        }
      } catch (error) {
        console.error("Error fetching data");
      }
    };
    fetchProfileAndSettings();
  }, [pathname, router]);

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  // 🚀 NEW: Added AI Agents to the Navigation Menu 🚀
  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'AI Agents', href: '/dashboard/agents', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    { name: 'Call Executions', href: '/dashboard/executions', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { name: 'My Numbers', href: '/dashboard/numbers', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { name: 'My Subscription', href: '/dashboard/plans', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Support', href: '/dashboard/support', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { name: 'Profile Settings', href: '/dashboard/settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const isRestricted = userProfile && Number(userProfile.balance) <= 0;

  const renderClientBranding = () => {
    if (userProfile?.logo_url) {
      return (
        <img 
          src={userProfile.logo_url} 
          alt="Client Logo" 
          className="h-8 max-w-[180px] object-contain"
        />
      );
    }
    
    const finalName = userProfile?.company_name || portalName || 'HIGHVANCE';

    if (finalName.toUpperCase() === 'HIGHVANCE') {
      return (
        <>
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 mr-3 shadow-md shadow-blue-500/20 shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight uppercase truncate">
            <span className="text-slate-900">HIGH</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">VANCE</span>
          </span>
        </>
      );
    }

    return (
      <>
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 mr-3 shadow-md shadow-blue-500/20 shrink-0">
          <span className="text-white font-extrabold text-sm">{finalName.charAt(0).toUpperCase()}</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase truncate">
          {finalName}
        </span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col shadow-2xl lg:shadow-none`}
      >
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          {renderClientBranding()}
        </div>

        {userProfile && (
          <div className="px-6 mt-6 mb-2">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl shadow-lg shadow-slate-900/20 text-white relative overflow-hidden">
              <div className="absolute top-[-10px] right-[-10px] w-24 h-24 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs font-semibold text-slate-300 mb-1 tracking-wide uppercase">Available Minutes</p>
              <h3 className="text-3xl font-extrabold tracking-tight">{Math.floor(Number(userProfile.balance))}</h3>
              
              {isRestricted ? (
                <Link href="/dashboard/plans" className="mt-4 inline-block w-full text-center bg-blue-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-400 transition-colors shadow-sm">
                  Add Funds to Unlock
                </Link>
              ) : (
                <div className="mt-3 flex items-center text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  Active & Synced
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-4 py-4 flex-1 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              
              // 🚀 Prevent clicking on Agents or Executions if balance is 0
              if (isRestricted && (item.name === 'Call Executions' || item.name === 'AI Agents')) {
                return (
                  <div key={item.name} className="flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-2xl text-slate-300 cursor-not-allowed">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                      {item.name}
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                );
              }

              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`group flex items-center px-3.5 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg className={`w-5 h-5 mr-3 transition-transform duration-200 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        <header 
          className={`sticky top-0 z-20 h-20 transition-all duration-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 ${
            scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-transparent border-b border-transparent'
          }`}
        >
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:bg-white p-2.5 rounded-xl mr-3 shadow-sm border border-gray-200 transition-colors focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">
              {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
             
             <div className="relative" ref={notifRef}>
               <button 
                  onClick={() => {setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false);}} 
                  className={`text-slate-500 hover:text-blue-600 p-2.5 rounded-full transition-all duration-200 bg-white border border-gray-200 shadow-sm ${isNotifOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'hover:bg-slate-50'}`}
               >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm animate-pulse"></span>
                  )}
               </button>

               {isNotifOpen && (
                 <div className="absolute right-0 mt-2 w-72 sm:w-80 -mr-12 sm:mr-0 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in origin-top-right z-50">
                   <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800">Notifications</h3>
                     <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{unreadCount} New</span>
                   </div>
                   <div className="max-h-72 sm:max-h-80 overflow-y-auto custom-scrollbar">
                     {notifications.map((notif) => (
                       <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-slate-50 cursor-pointer transition-colors ${notif.unread ? 'bg-blue-50/30' : ''}`}>
                         <p className={`text-sm font-semibold ${notif.unread ? 'text-slate-900' : 'text-slate-600'} break-words`}>{notif.title}</p>
                         <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.desc}</p>
                         <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{notif.time}</p>
                       </div>
                     ))}
                   </div>
                   <div className="px-4 py-2.5 border-t border-gray-50 text-center bg-gray-50/50">
                     <button className="text-xs font-bold text-blue-600 hover:text-blue-700 w-full">Mark all as read</button>
                   </div>
                 </div>
               )}
             </div>

             <div className="relative" ref={profileRef}>
               <div 
                 onClick={() => {setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false);}}
                 className="flex items-center cursor-pointer bg-white p-1.5 pr-4 rounded-full border border-gray-200 shadow-sm hover:border-blue-300 transition-all duration-200"
               >
                 <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                   {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                 </div>
                 <div className="hidden md:block ml-3">
                   <p className="text-sm font-bold text-slate-700 leading-tight truncate max-w-[120px]">{userProfile?.name || 'Loading...'}</p>
                   <p className="text-[11px] font-semibold text-slate-500">Client Account</p>
                 </div>
                 <svg className="hidden md:block w-4 h-4 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
               </div>

               {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in origin-top-right z-50">
                   <div className="px-4 py-3 border-b border-gray-50 mb-1 lg:hidden">
                     <p className="text-sm font-bold text-slate-800">{userProfile?.name}</p>
                     <p className="text-xs text-slate-500 truncate">{userProfile?.email}</p>
                   </div>
                   <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                     <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                     Profile Settings
                   </Link>
                   <Link href="/dashboard/plans" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                     <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                     Billing & Plans
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}