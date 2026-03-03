// app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [generalData, setGeneralData] = useState({ portal_name: '', support_email: '', admin_name: '' });
  const [apiData, setApiData] = useState({ bolna_api_key: '' });
  const [securityData, setSecurityData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  
  const [domainData, setDomainData] = useState({ custom_domain: '' });

  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setGeneralData({
            portal_name: data.data.settings?.portal_name || 'HIGHVANCE',
            support_email: data.data.settings?.support_email || 'support@company.com',
            admin_name: data.data.admin?.name || 'Admin User'
          });
          setApiData({
            bolna_api_key: data.data.settings?.bolna_api_key || ''
          });
          setDomainData({
            custom_domain: '' 
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

    if (tab === 'domain') {
      setStatusMsg({ type: 'success', text: 'Domain configuration instructions generated below!' });
      return; 
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
        setStatusMsg({ type: 'success', text: data.message || 'Settings updated successfully!' });
        if (tab === 'security') {
          setSecurityData({ current_password: '', new_password: '', confirm_password: '' });
        }
        if (tab === 'general') {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Server error. Please try again later.' });
    }
    
    setIsSaving(false);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const copyToClipboard = () => {
    const code = `
<!DOCTYPE html>
<html>
<head>
    <title>${generalData.portal_name}</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <iframe src="https://bolna-pi.vercel.app"></iframe>
</body>
</html>`;
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Settings</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage your portal configurations, domains, and security.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar">
            <button 
              onClick={() => {setActiveTab('general'); setStatusMsg(null);}} 
              className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              General Settings
            </button>
            <button 
              onClick={() => {setActiveTab('api'); setStatusMsg(null);}} 
              className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'api' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              API Integrations
            </button>
            <button 
              onClick={() => {setActiveTab('domain'); setStatusMsg(null);}} 
              className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'domain' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              Domain Setup
            </button>
            <button 
              onClick={() => {setActiveTab('security'); setStatusMsg(null);}} 
              className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Security Options
            </button>
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {statusMsg && (
            <div className={`m-6 p-4 rounded-xl text-sm font-bold flex items-center animate-fade-in shadow-sm ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {statusMsg.type === 'success' ? (
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              {statusMsg.text}
            </div>
          )}

          {activeTab === 'general' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-2' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Brand & Profile</h3>
              <form onSubmit={(e) => handleSave(e, 'general')} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Portal Name</label>
                    <input type="text" required value={generalData.portal_name} onChange={(e) => setGeneralData({...generalData, portal_name: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" placeholder="e.g. HIGHVANCE" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Support Email</label>
                    <input type="email" required value={generalData.support_email} onChange={(e) => setGeneralData({...generalData, support_email: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" placeholder="support@yourdomain.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Admin Full Name</label>
                  <input type="text" required value={generalData.admin_name} onChange={(e) => setGeneralData({...generalData, admin_name: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" placeholder="Your Name" />
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={isSaving} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]">
                    {isSaving ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'api' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-2' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Bolna Integration</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Connect your master Bolna account to enable automated sub-account provisioning.</p>
              <form onSubmit={(e) => handleSave(e, 'api')} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Bolna Enterprise API Key</label>
                  <div className="relative">
                    <input 
                      type={showApiKey ? 'text' : 'password'} 
                      value={apiData.bolna_api_key} 
                      onChange={(e) => setApiData({...apiData, bolna_api_key: e.target.value})} 
                      placeholder="bn-..." 
                      className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none font-mono text-sm transition-all text-slate-900" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
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
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm text-purple-800 font-medium leading-relaxed">Your API key is securely encrypted and stored in the database. It is used to generate client sub-accounts and fetch live execution metrics.</p>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={isSaving} className="bg-purple-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-purple-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]">
                    {isSaving ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save API Key'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'domain' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-2' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Custom Domain Mapping</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Link your Hostinger or external domain to this Vercel portal without complex DNS setup.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Enter Your Custom Domain</label>
                  <input 
                    type="text" 
                    value={domainData.custom_domain} 
                    onChange={(e) => setDomainData({custom_domain: e.target.value})} 
                    placeholder="e.g. www.highvance.com" 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" 
                  />
                </div>

                {domainData.custom_domain && (
                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl animate-fade-in">
                    <h4 className="font-bold text-blue-900 mb-2">Setup Instructions</h4>
                    <p className="text-sm text-blue-800 mb-4 leading-relaxed">
                      To show this portal on <strong>{domainData.custom_domain}</strong>, go to your Hostinger File Manager and create an <code>index.html</code> file with the exact code below. It will securely load your portal in fullscreen mode.
                    </p>
                    
                    <div className="relative">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono">
{`<!DOCTYPE html>
<html>
<head>
    <title>${generalData.portal_name}</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <iframe src="https://bolna-pi.vercel.app"></iframe>
</body>
</html>`}
                      </pre>
                      <button 
                        onClick={copyToClipboard}
                        className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs text-slate-500 italic">Note: This iFrame method is the fastest way to map domains without touching Vercel/Hostinger DNS records.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-2' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h3>
              <form onSubmit={(e) => handleSave(e, 'security')} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                  <input type="password" required value={securityData.current_password} onChange={(e) => setSecurityData({...securityData, current_password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all text-slate-900 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <input type="password" required value={securityData.new_password} onChange={(e) => setSecurityData({...securityData, new_password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all text-slate-900 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                  <input type="password" required value={securityData.confirm_password} onChange={(e) => setSecurityData({...securityData, confirm_password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all text-slate-900 font-medium" />
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto min-w-[200px]">
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