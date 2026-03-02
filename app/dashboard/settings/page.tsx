// app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ClientSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form States
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success) {
          setProfileData({ name: data.data.name, email: data.data.email });
        }
      } catch (error) {
        console.error('Failed to load profile');
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent, tab: string) => {
    e.preventDefault();
    setStatusMsg(null);

    if (tab === 'security') {
      if (securityData.newPassword !== securityData.confirmPassword) {
        setStatusMsg({ type: 'error', text: 'New passwords do not match!' });
        return;
      }
      if (securityData.newPassword.length < 6) {
        setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
      }
    }

    setIsSaving(true);
    let payload: any = { tab };
    if (tab === 'profile') payload = { ...payload, name: profileData.name };
    if (tab === 'security') payload = { ...payload, currentPassword: securityData.currentPassword, newPassword: securityData.newPassword };

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        if (tab === 'security') setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatusMsg({ type: 'error', text: data.message });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
    }
    
    setIsSaving(false);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage your personal information and security preferences.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <button onClick={() => {setActiveTab('profile'); setStatusMsg(null);}} className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Profile
            </button>
            <button onClick={() => {setActiveTab('security'); setStatusMsg(null);}} className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Security
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Status Message Display */}
          {statusMsg && (
            <div className={`m-6 p-4 rounded-xl text-sm font-semibold flex items-start animate-fade-in ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {statusMsg.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h3>
              <form onSubmit={(e) => handleSave(e, 'profile')} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" required value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full max-w-md px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input type="email" disabled value={profileData.email} className="w-full max-w-md px-4 py-3 bg-slate-100 border border-gray-200 rounded-xl text-slate-500 cursor-not-allowed outline-none" />
                  <p className="text-xs text-slate-400 mt-2 font-medium">Email address cannot be changed. Contact support for updates.</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Update Password</h3>
              <form onSubmit={(e) => handleSave(e, 'security')} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input type="password" required value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <input type="password" required value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md hover:-translate-y-0.5 w-full sm:w-auto">{isSaving ? 'Updating...' : 'Update Password'}</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}