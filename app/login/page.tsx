// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      if (data.role === 'admin') router.push('/admin/dashboard');
      else router.push('/dashboard');
    } else {
      setError(data.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0B0F19] overflow-hidden font-sans selection:bg-blue-500/30">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}} />

      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[10%] right-[-5%] w-[35rem] h-[35rem] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <div className="bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-white/20 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

          <div className="flex justify-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <div className="absolute inset-0 rounded-2xl border border-white/20"></div>
              <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">Welcome Back</h2>
            <p className="text-blue-100/70 mt-2 text-sm font-medium">Sign in to your AI Portal dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl text-sm font-medium animate-fade-in backdrop-blur-sm">
              <svg className="w-5 h-5 mr-2.5 flex-shrink-0 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-blue-100/90 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="admin@portal.com"
                  className="w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-blue-200/40 backdrop-blur-md"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-semibold text-blue-100/90">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-blue-200/40 backdrop-blur-md"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-4 rounded-2xl hover:from-blue-500 hover:to-indigo-500 shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_10px_25px_rgba(59,130,246,0.5)] transform transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-6 border border-blue-500/50 hover:-translate-y-0.5"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Secure Login'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-blue-200/60 font-medium">
            Protected by Enterprise-Grade Security
          </p>
        </div>
      </div>
    </div>
  );
}