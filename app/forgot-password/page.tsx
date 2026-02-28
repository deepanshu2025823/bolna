// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', message: 'If an account exists, a reset link has been sent.' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to send reset link.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      <div 
        className="hidden md:flex md:w-1/2 relative bg-cover bg-center items-center justify-center p-12"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')" // A sleek, dark tech/server room image
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
        
        <div className="relative z-10 text-white max-w-lg text-center md:text-left mt-auto mb-20">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-6 shadow-lg shadow-blue-500/30">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h1 className="text-4xl lg:text-4xl font-extrabold mb-4 tracking-tight leading-tight">
            Secure Account Recovery
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed font-light">
            We employ enterprise-grade security to ensure your administrative access remains protected at all times.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50/50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 pointer-events-none"></div>

          <div className="mb-8 relative z-10">
            <Link href="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-slate-900 transition-colors mb-6 group">
              <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2.5">Forgot Password?</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Enter your registered email address and we'll send you a secure link to reset your password.
            </p>
          </div>

          {status.type === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-800 rounded-xl text-[14px] md:text-[13px] font-medium flex items-start animate-fade-in relative z-10">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="leading-relaxed">{status.message}</span>
            </div>
          )}

          {status.type === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-sm font-medium flex items-start animate-fade-in relative z-10">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="leading-relaxed">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="admin@portal.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-400"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status.type === 'success'}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status.type === 'loading' || status.type === 'success'}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
            >
              {status.type === 'loading' ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Send Reset Instructions'}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}