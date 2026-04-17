import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, Users, CalendarHeart, BarChart2, Search, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);
  const sidebarInitial = (storedUser?.name || 'U').trim().charAt(0).toUpperCase() || 'U';
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchTerm(q);
  }, [location.search]);

  const resolveSearchPath = (query) => {
    const q = query.toLowerCase();
    if (/(leave|vacation|sick|pending|approve|reject)/.test(q)) return '/dashboard/leaves';
    if (/(attendance|checkin|present|late|absent|clock)/.test(q)) return '/dashboard/attendance';
    if (/(analytic|report|insight|chart)/.test(q)) return '/dashboard/analytics';
    if (/(team|employee|directory|dept|department|hr|engineering|design|product|finance|operations|email)/.test(q)) {
      return '/dashboard/directory';
    }
    if (location.pathname.startsWith('/dashboard/')) return location.pathname;
    return '/dashboard/directory';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    const path = resolveSearchPath(query);
    if (!query) {
      navigate(path, { replace: false });
      return;
    }
    navigate(`${path}?q=${encodeURIComponent(query)}`, { replace: false });
  };

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={18} />, activeIcon: <LayoutDashboard size={18} fill="currentColor" strokeWidth={0}/>, label: 'Overview' },
    { path: '/dashboard/attendance', icon: <Clock size={18} />, activeIcon: <Clock size={18} fill="currentColor" strokeWidth={0}/>, label: 'Attendance' },
    { path: '/dashboard/directory', icon: <Users size={18} />, activeIcon: <Users size={18} fill="currentColor" strokeWidth={0}/>, label: 'Teams' },
    { path: '/dashboard/leaves', icon: <CalendarHeart size={18} />, activeIcon: <CalendarHeart size={18} fill="currentColor" strokeWidth={0}/>, label: 'Leave Hub' },
    { path: '/dashboard/analytics', icon: <BarChart2 size={18} />, activeIcon: <BarChart2 size={18} fill="currentColor" strokeWidth={0}/>, label: 'Analytics' },
  ];

  return (
    <div className="flex h-screen overflow-hidden p-6 gap-6 select-none relative bg-gradient-to-br from-orange-300/40 via-orange-100/50 to-orange-50/60">
      
      {/* Fixed Thin Sidebar - Smaller scaled components */}
      <div className="hidden lg:flex flex-col w-[80px] glass-pill rounded-[30px] h-full flex-shrink-0 z-50 shadow-[8px_8px_40px_rgba(249,115,22,0.15)] py-8 px-[18px] bg-white/50 backdrop-blur-xl border border-white/60 relative">
        
        {/* Avatar */}
        <div className="flex justify-center mb-10">
          <div className="w-[44px] h-[44px] rounded-full border-[2.5px] border-white shadow-sm overflow-hidden flex-shrink-0 bg-white hover:scale-105 transition-transform cursor-pointer relative z-10">
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-primary text-white font-black flex items-center justify-center text-[14px] tracking-tighter">{sidebarInitial}</div>
          </div>
        </div>

        {/* Dynamic Individual Pop-Out Nav Items */}
        <div className="flex flex-col gap-3 flex-1 w-full mt-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <div key={item.path} className="relative w-[44px] h-[44px] group z-20">
                <Link 
                  to={item.path} 
                  className={`absolute left-0 top-0 flex items-center h-[44px] rounded-[22px] whitespace-nowrap transition-all duration-300 px-[13px]
                  ${isActive 
                    ? 'bg-white text-primary shadow-[0_4px_25px_rgba(249,115,22,0.18)] border border-white/80 w-[44px] group-hover:w-[150px]' 
                    : 'bg-transparent text-orange-900/50 hover:bg-white/95 hover:text-orange-900/80 hover:shadow-md hover:border hover:border-white/80 w-[44px] hover:w-[150px]'
                  }`}
                >
                  <span className={`flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary'}`}>
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  
                  <span className={`ml-3 text-[13px] opacity-0 translate-x-[-5px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 delay-[50ms] ${isActive ? 'font-black' : 'font-extrabold'}`}>
                    {item.label}
                  </span>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Footer Action - Individual Pop-out */}
        <div className="mt-auto w-full pt-6 relative border-t border-orange-900/10">
           <div className="relative w-[44px] h-[44px] group z-20 mt-2">
             <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/login'; }} 
               className="absolute left-0 top-0 flex items-center h-[44px] rounded-[22px] whitespace-nowrap transition-all duration-300 px-[13px] w-[44px] hover:w-[120px] bg-transparent hover:bg-white/95 hover:shadow-md text-red-400 hover:text-red-500 hover:border hover:border-white/80"
             >
               <span className="flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                 <LogOut size={18} />
               </span>
               <span className="ml-3 text-[13px] font-extrabold opacity-0 translate-x-[-5px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 delay-[50ms]">
                 Logout
               </span>
             </button>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-6 py-2">
        <div className="mb-6 flex justify-between items-center pr-2 lg:pr-8 mt-2 w-full">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[400px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search directory, leaves, analytics..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/50 backdrop-blur-xl border border-white/60 text-gray-800 font-extrabold h-[46px] rounded-[23px] pl-11 pr-6 outline-none focus:bg-white/80 hover:bg-white/60 transition-all shadow-sm placeholder:text-slate-400/80 focus:shadow-[0_4px_25px_rgba(249,115,22,0.1)] text-[13px]"
            />
          </form>
          <div className="text-primary font-black text-[24px] tracking-tighter italic drop-shadow-md">
            1Clik.
          </div>
        </div>

        <main className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10 pr-4">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
