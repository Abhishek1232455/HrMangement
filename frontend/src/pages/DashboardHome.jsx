import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const Sparkline = ({ color, points }) => (
  <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
    <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
  </svg>
);

const DashboardHome = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get('/api/employees');
        const attRes = await api.get('/api/attendance');
        const leaveRes = await api.get('/api/leaves');
        
        setEmployees(empRes.data);
        setAttendance(attRes.data);
        setLeaves(leaveRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalMembers = employees.length;
  const activeToday = attendance.filter(a => new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'Present').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const displayName = storedUser?.name || 'Team Member';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'TM';
  const welcomeQuotes = [
    'Great to see you. Let us make today productive.',
    'Welcome back. Small wins today build big results.',
    'You are in control. Lead the day with confidence.',
    'Hope your day is going well. Let us keep the team moving.',
    'Good to have you back. Progress starts with one action.'
  ];
  const quoteIndex = (new Date().getDate() + displayName.length) % welcomeQuotes.length;
  const welcomeQuote = welcomeQuotes[quoteIndex];

  if (loading) return <div className="text-primary font-bold">Loading 1Clik dashboard...</div>;

  return (
    <div className="flex flex-col gap-5 w-full pb-10 animate-in fade-in duration-500 lg:pr-6">
      
      {/* Top 3 Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="glass-card flex flex-col justify-between hover:-translate-y-1 transition-transform">
          <div className="p-6 md:p-7">
            <div className="w-[54px] h-[54px] rounded-full bg-primary text-white font-black text-lg flex items-center justify-center shadow-[0_8px_20px_rgba(249,115,22,0.4)] mb-8">
              {initials}
            </div>
            <div>
               <h2 className="text-[22px] font-black text-slate-800 tracking-tighter mb-1">Welcome, {displayName}</h2>
               <p className="text-[13px] text-slate-500 font-bold tracking-tight">{welcomeQuote}</p>
            </div>
          </div>
        </div>

        {/* Active Members Card */}
        <div className="glass-card p-6 md:p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[11px] font-extrabold text-orange-900/40 uppercase tracking-widest">Active Today</h3>
            <div className="w-[85px]">
              <Sparkline color="#22C55E" points="0,20 20,10 40,22 60,8 80,18 100,-2" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-[40px] font-black text-slate-800 leading-none tracking-tighter">{activeToday}/{totalMembers}</div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-green-500 font-extrabold text-[13px] tracking-tight">{totalMembers ? Math.round((activeToday/totalMembers)*100) : 0}%</span>
               <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Attendance Rate</span>
            </div>
          </div>
        </div>

        {/* Pending Leaves Card */}
        <div className="glass-card p-6 md:p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[11px] font-extrabold text-orange-900/40 uppercase tracking-widest">On Leave</h3>
            <div className="w-[85px]">
              <Sparkline color="#EF4444" points="0,5 20,15 40,10 60,30 80,5 100,20" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-[40px] font-black text-slate-800 leading-none tracking-tighter">{onLeave}</div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-red-500 font-extrabold text-[13px] tracking-tight">{pendingLeaves} Pending</span>
               <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Review required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats / Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Wide Column - Attendance Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card p-6 md:p-7">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Recent Attendance Log</h3>
              <button
                type="button"
                onClick={() => navigate('/dashboard/attendance')}
                className="text-[11px] font-extrabold text-primary flex items-center uppercase tracking-widest px-3 py-1.5 rounded-lg border border-transparent hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
              >
                Full list <ChevronRight size={14} className="ml-1" />
              </button>
            </div>

            {/* Table */}
            <div className="w-full">
              <div className="grid grid-cols-12 gap-4 text-[10px] font-extrabold text-slate-400/80 uppercase tracking-widest mb-3 border-b border-orange-900/10 pb-3 pl-3">
                <div className="col-span-1 border border-transparent"></div>
                <div className="col-span-4">Employee Name</div>
                <div className="col-span-4">Status</div>
                <div className="col-span-3">Check-In Time</div>
              </div>

              <div className="flex flex-col gap-2">
                {attendance.slice(0, 5).map((row, i) => (
                  <div key={i} className={`grid grid-cols-12 gap-4 text-[13px] items-center py-3 px-3 rounded-[20px] border border-transparent transition-all ${i === 0 || i === 2 ? 'bg-white/70 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-white/80' : 'hover:bg-white/50 cursor-pointer'}`}>
                    <div className="col-span-1 flex justify-center">
                       <input type="checkbox" className="w-[14px] h-[14px] rounded-[4px] border-orange-200 bg-white/40 shadow-inner" />
                    </div>
                    <div className="col-span-4 flex items-center gap-3 font-bold text-slate-800 tracking-tight">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] shadow-sm"><span className="leading-none">{row.employeeId?.name?.[0] || '?'}</span></div>
                      {row.employeeId?.name || 'Unknown'}
                    </div>
                    <div className="col-span-4">
                      <span className={`px-3.5 py-1.5 text-[10px] font-extrabold border rounded-[10px] tracking-widest uppercase ${row.status === 'Present' ? 'bg-green-50 text-green-500 border-green-200/60' : row.status === 'Late' ? 'bg-amber-50 text-amber-500 border-amber-200/60' : 'bg-red-50 text-red-500 border-red-200/60'}`}>
                        {row.status}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center font-bold text-slate-500 text-[12px]">
                      {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                    </div>
                  </div>
                ))}
                {attendance.length === 0 && <div className="text-center text-slate-400 py-4 font-bold">No records found.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Narrow Column - Leaves & Action items */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-6 md:p-7 relative overflow-hidden flex-1">
            {/* Subtle left accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-orange-300"></div>

             <div className="flex justify-between items-center mb-6 pl-1">
              <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Pending Leaves</h3>
              <button
                type="button"
                onClick={() => navigate('/dashboard/leaves')}
                className="text-[11px] font-extrabold text-primary uppercase tracking-widest px-3 py-1.5 rounded-lg border border-transparent hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
              >
                See all
              </button>
            </div>
            
            <div className="space-y-6 pl-1">
              {leaves.slice(0, 3).map((leave, i) => (
                <div key={i} className={i !== 0 ? "border-t border-orange-900/10 pt-5" : ""}>
                   <h4 className="text-[15px] font-black text-slate-800 tracking-tight flex items-center justify-between">
                     {leave.employeeId?.name}
                     <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${leave.status === 'Approved' ? 'bg-green-100 text-green-600' : leave.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{leave.status}</span>
                   </h4>
                   <p className="text-[13px] text-slate-500 font-bold leading-relaxed mt-0.5 tracking-tight truncate">{leave.reason || "No reason given"}</p>
                   <div className="text-[11px] font-bold text-slate-800 mt-2.5 flex items-center gap-2">
                     <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase tracking-wider text-[9px] font-black">{leave.type} Leaf</span>
                     <span className="text-slate-400">{new Date(leave.from).toLocaleDateString()}</span>
                   </div>
                </div>
              ))}
              {leaves.length === 0 && <div className="text-slate-400 font-bold">No leave requests found.</div>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
