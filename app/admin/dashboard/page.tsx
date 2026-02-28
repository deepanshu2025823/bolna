// app/admin/dashboard/page.tsx
export default function AdminDashboard() {
  const stats = [
    { 
      title: 'Total Active Clients', 
      value: '12', 
      trend: '+2 this week', 
      isUp: true,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
    },
    { 
      title: 'Total Executions', 
      value: '3,420', 
      trend: '+14% from last month', 
      isUp: true,
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
    },
    { 
      title: 'Total AI Minutes', 
      value: '1,280', 
      trend: '+2% from last week', 
      isUp: true,
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
    },
    { 
      title: 'Est. Margin Profit', 
      value: '$840.50', 
      trend: '+5% from last month', 
      isUp: true,
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Admin 👋</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-medium">Here is what's happening with your AI portal today.</p>
        </div>
        <div className="w-full sm:w-auto relative z-10 mt-2 sm:mt-0">
          <button className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 flex items-center justify-center transform hover:-translate-y-0.5">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bgColor} transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">{stat.title}</h3>
              <p className="text-3xl font-extrabold text-slate-900 mb-3">{stat.value}</p>
              <div className="flex items-center text-sm">
                <div className={`flex items-center px-2 py-1 rounded-md ${stat.isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.isUp ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
                  </svg>
                  <span className="font-bold text-xs">{stat.trend.split(' ')[0]}</span>
                </div>
                <span className="text-slate-400 text-xs font-medium ml-2">
                  {stat.trend.split(' ').slice(1).join(' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recent Client Activity</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Live execution logs from Bolna API</p>
          </div>
          <button className="text-sm bg-white border border-gray-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            View All Logs
          </button>
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center text-center bg-white min-h-[300px]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">No active logs found</h4>
          <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">
            Connect the database and add clients to start seeing real-time AI execution data here.
          </p>
          <button className="mt-6 text-blue-600 font-semibold text-sm hover:text-blue-700 hover:underline flex items-center">
            Configure Database Settings
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}