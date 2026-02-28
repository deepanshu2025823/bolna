// app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success) {
          setUserProfile(data.data);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Error fetching profile");
      }
    };
    fetchProfile();
  }, [pathname, router]);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Call Executions', href: '/dashboard/executions', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { name: 'My Subscription', href: '/dashboard/plans', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Profile Settings', href: '/dashboard/settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const isRestricted = userProfile && Number(userProfile.balance) <= 0;

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex font-sans text-slate-900">
      
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-20 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-[280px] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col shadow-2xl lg:shadow-none`}
      >
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 mr-3 shadow-md shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Client <span className="text-blue-600">Portal</span>
          </span>
        </div>

        {userProfile && (
          <div className="px-6 mt-6 mb-2">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl shadow-lg shadow-slate-900/20 text-white relative overflow-hidden">
              <div className="absolute top-[-10px] right-[-10px] w-24 h-24 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs font-semibold text-slate-300 mb-1 tracking-wide uppercase">Wallet Balance</p>
              <h3 className="text-3xl font-extrabold tracking-tight">${Number(userProfile.balance).toFixed(2)}</h3>
              
              {isRestricted ? (
                <Link href="/dashboard/plans" className="mt-4 inline-block w-full text-center bg-blue-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-400 transition-colors">
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
              
              if (isRestricted && item.name === 'Call Executions') {
                return (
                  <div key={item.name} className="flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-2xl text-slate-300 cursor-not-allowed">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                      {item.name}
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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
                  <svg 
                    className={`w-5 h-5 mr-3 transition-transform duration-200 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-blue-500'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 m-4">
          <Link 
            href="/login" 
            className="group flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </Link>
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
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight hidden sm:block">
              {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
             <div className="flex items-center cursor-pointer bg-white p-1.5 pr-4 rounded-full border border-gray-200 shadow-sm transition-all duration-200">
               <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                 {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
               </div>
               <div className="hidden md:block ml-3">
                 <p className="text-sm font-bold text-slate-700 leading-tight">{userProfile?.name || 'Loading...'}</p>
                 <p className="text-[11px] font-semibold text-slate-500">{userProfile?.email || '...'}</p>
               </div>
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