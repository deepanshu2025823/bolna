// app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form States
  const [generalData, setGeneralData] = useState({ portal_name: '', support_email: '', admin_name: '' });
  const [apiData, setApiData] = useState({ bolna_api_key: '' });
  const [securityData, setSecurityData] = useState({ current_password: '', new_password: '', confirm_password: '' });

  // UI States
  const [showApiKey, setShowApiKey] = useState(false);

  // Fetch current settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setGeneralData({
            portal_name: data.data.settings.portal_name || 'AI Portal Pro',
            support_email: data.data.settings.support_email || 'support@company.com',
            admin_name: data.data.admin.name || 'Admin User'
          });
          setApiData({
            bolna_api_key: data.data.settings.bolna_api_key || ''
          });
        }
      } catch (error) {
        console.error('Failed to load settings');
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent, tab: string) => {
    e.preventDefault();
    setStatusMsg(null);

    // Basic Validation for Security Tab
    if (tab === 'security') {
      if (securityData.new_password !== securityData.confirm_password) {
        setStatusMsg({ type: 'error', text: 'New passwords do not match!' });
        return;
      }
      if (securityData.new_password.length < 6) {
        setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
      }
    }

    setIsSaving(true);

    let payload = { tab };
    if (tab === 'general') payload = { ...payload, ...generalData };
    if (tab === 'api') payload = { ...payload, ...apiData };
    if (tab === 'security') payload = { ...payload, ...securityData };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        if (tab === 'security') {
          setSecurityData({ current_password: '', new_password: '', confirm_password: '' });
        }
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Settings</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage your portal configurations, API keys, and security dynamically.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <button onClick={() => {setActiveTab('general'); setStatusMsg(null);}} className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              General Settings
            </button>
            <button onClick={() => {setActiveTab('api'); setStatusMsg(null);}} className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'api' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              API Integrations
            </button>
            <button onClick={() => {setActiveTab('security'); setStatusMsg(null);}} className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
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

          {activeTab === 'general' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Brand & Profile</h3>
              <form onSubmit={(e) => handleSave(e, 'general')} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Portal Name</label>
                    <input type="text" required value={generalData.portal_name} onChange={(e) => setGeneralData({...generalData, portal_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Support Email</label>
                    <input type="email" required value={generalData.support_email} onChange={(e) => setGeneralData({...generalData, support_email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Full Name</label>
                  <input type="text" required value={generalData.admin_name} onChange={(e) => setGeneralData({...generalData, admin_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={isSaving} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md disabled:opacity-70 flex items-center justify-center min-w-[140px]">
                    {isSaving ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'api' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Bolna Integration</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Connect your master Bolna account to enable automated sub-account provisioning.</p>
              <form onSubmit={(e) => handleSave(e, 'api')} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bolna Enterprise API Key</label>
                  <div className="relative">
                    <input 
                      type={showApiKey ? 'text' : 'password'} 
                      value={apiData.bolna_api_key} 
                      onChange={(e) => setApiData({...apiData, bolna_api_key: e.target.value})} 
                      placeholder="sk_live_..." 
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm transition-all" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showApiKey ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-1.29c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.29 3.29" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-start">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm text-purple-800 font-medium">Your API key is securely encrypted and stored in the database. It is used to generate client sub-accounts.</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={isSaving} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md disabled:opacity-70 flex items-center justify-center min-w-[140px]">
                    {isSaving ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save API Key'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h3>
              <form onSubmit={(e) => handleSave(e, 'security')} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input type="password" required value={securityData.current_password} onChange={(e) => setSecurityData({...securityData, current_password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input type="password" required value={securityData.new_password} onChange={(e) => setSecurityData({...securityData, new_password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <input type="password" required value={securityData.confirm_password} onChange={(e) => setSecurityData({...securityData, confirm_password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-md disabled:opacity-70 flex items-center justify-center w-full sm:w-auto min-w-[180px]">
                    {isSaving ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}