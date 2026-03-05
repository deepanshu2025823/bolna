// app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ClientSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [brandData, setBrandData] = useState({ company_name: '', logo_url: '' });
  const [domainData, setDomainData] = useState({ custom_domain: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success) {
          setProfileData({ name: data.data.name, email: data.data.email });
          setBrandData({ 
            company_name: data.data.company_name || '',
            logo_url: data.data.logo_url || ''
          });
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

    if (tab === 'domain') {
      setStatusMsg({ type: 'success', text: 'Domain configuration instructions generated below!' });
      return; 
    }

    setIsSaving(true);
    let payload: any = { tab };
    
    if (tab === 'profile') payload = { ...payload, name: profileData.name };
    if (tab === 'security') payload = { ...payload, currentPassword: securityData.currentPassword, newPassword: securityData.newPassword };
    if (tab === 'branding') payload = { ...payload, company_name: brandData.company_name, logo_url: brandData.logo_url };

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
        if (tab === 'branding') {
          setTimeout(() => window.location.reload(), 1000);
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

  const copyToClipboard = () => {
    const code = `
<!DOCTYPE html>
<html>
<head>
    <title>${brandData.company_name || 'Client Portal'}</title>
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
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage your personal information, workspace branding, domains, and security.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar">
            <button onClick={() => {setActiveTab('profile'); setStatusMsg(null);}} className={`flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Profile
            </button>
            <button onClick={() => {setActiveTab('branding'); setStatusMsg(null);}} className={`flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'branding' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Brand Identity
            </button>
            
            <button onClick={() => {setActiveTab('domain'); setStatusMsg(null);}} className={`flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'domain' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              Domain Setup
            </button>

            <button onClick={() => {setActiveTab('security'); setStatusMsg(null);}} className={`flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent'}`}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Security
            </button>
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                  <input type="text" required value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full max-w-md px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input type="email" disabled value={profileData.email} className="w-full max-w-md px-4 py-3.5 bg-slate-100 border border-gray-200 rounded-xl text-slate-500 cursor-not-allowed outline-none font-medium" />
                  <p className="text-xs text-slate-400 mt-2 font-medium">Email address cannot be changed. Contact support for updates.</p>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Brand Identity</h3>
              <p className="text-sm text-slate-500 mb-6">Customize the portal to reflect your company's brand in the sidebar.</p>
              <form onSubmit={(e) => handleSave(e, 'branding')} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company / Workspace Name</label>
                  <input type="text" value={brandData.company_name} onChange={(e) => setBrandData({...brandData, company_name: e.target.value})} placeholder="e.g. My Agency" className="w-full max-w-md px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Logo URL (.png or .svg)</label>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
                      {brandData.logo_url ? (
                        <img src={brandData.logo_url} alt="Logo" className="h-full w-full object-contain p-2" />
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      )}
                    </div>
                    <input type="url" value={brandData.logo_url} onChange={(e) => setBrandData({...brandData, logo_url: e.target.value})} placeholder="https://yourdomain.com/logo.png" className="w-full max-w-sm px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all font-medium text-slate-900" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Paste the direct URL to your logo image. Transparent PNG works best.</p>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 hover:-translate-y-0.5">{isSaving ? 'Saving...' : 'Save Brand Settings'}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'domain' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Custom Domain Mapping</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Host your unique client portal on your own domain.</p>
              
              <form onSubmit={(e) => handleSave(e, 'domain')} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Enter Your Custom Domain</label>
                  <input 
                    type="text" 
                    value={domainData.custom_domain} 
                    onChange={(e) => setDomainData({custom_domain: e.target.value})} 
                    placeholder="e.g. portal.myagency.com" 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" 
                  />
                </div>

                {domainData.custom_domain && (
                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl animate-fade-in">
                    <h4 className="font-bold text-blue-900 mb-2">Setup Instructions</h4>
                    <p className="text-sm text-blue-800 mb-4 leading-relaxed">
                      To host this portal on <strong>{domainData.custom_domain}</strong>, go to your Domain's File Manager and create an <code>index.html</code> file with the code below.
                    </p>
                    <div className="relative">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono">
{`<!DOCTYPE html>
<html>
<head>
    <title>${brandData.company_name || 'Client Portal'}</title>
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
                        type="button"
                        onClick={copyToClipboard}
                        className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={`p-6 sm:p-10 animate-fade-in ${statusMsg ? 'pt-0' : ''}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Update Password</h3>
              <form onSubmit={(e) => handleSave(e, 'security')} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input type="password" required value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <input type="password" required value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900" />
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSaving} className="bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md hover:-translate-y-0.5 shadow-red-500/20 w-full sm:w-auto">{isSaving ? 'Updating...' : 'Update Password'}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}