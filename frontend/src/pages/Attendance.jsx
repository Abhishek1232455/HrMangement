import React, { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import api from '../lib/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/api/attendance');
        setAttendance(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttendance();
  }, []);

  // Timer Hook
  useEffect(() => {
    if (!isWorking) {
      return undefined;
    }
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorking]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleSession = () => {
    if (!isWorking) {
      setIsWorking(true);
      // Optional: Hit a mock endpoint to signify Check-In
    } else {
      setIsWorking(false);
      // Optional: Hit endpoint to check-out and log the raw hours
      setSessionTime(0); // Reset timer or keep it for the day until refresh
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-500 lg:pr-6">
      
      {/* Active Session Tracker */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-[0_8px_30px_rgba(249,115,22,0.12)] border-[2px] border-white/80 relative overflow-hidden">
        
        {/* Soft animated background pulse if working */}
        {isWorking && (
          <div className="absolute inset-0 bg-green-400/10 animate-pulse pointer-events-none"></div>
        )}

        <div className="mb-6 md:mb-0 relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
           <div className="flex items-center gap-3 mb-1">
             <h2 className="text-[24px] font-black text-slate-800 tracking-tighter">My Working Session</h2>
             {isWorking && (
               <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 shadow-sm animate-pulse">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                 Live
               </span>
             )}
           </div>
           <p className="text-[13px] text-slate-500 font-bold tracking-tight">Clock in and track your daily hours</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
           <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/60 shadow-sm min-w-[160px] flex justify-center">
             <span className={`text-4xl font-black tabular-nums tracking-wider transition-colors duration-300 ${isWorking ? 'text-primary drop-shadow-sm' : 'text-slate-700'}`}>
               {formatTime(sessionTime)}
             </span>
           </div>

           <button 
              onClick={toggleSession} 
              className={`flex items-center gap-3 px-8 h-[54px] rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all duration-300 shadow-md ${
                isWorking 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_6px_20px_rgba(243,24,66,0.3)] hover:-translate-y-0.5' 
                  : 'bg-primary hover:bg-orange-600 text-white shadow-[0_6px_20px_rgba(249,115,22,0.4)] hover:-translate-y-0.5'
              }`}
            >
             {isWorking ? (
               <>
                 <Square size={16} fill="currentColor" /> Stop Timer
               </>
             ) : (
               <>
                 <Play size={16} fill="currentColor" /> Start Session
               </>
             )}
           </button>
        </div>
      </div>

      {/* Historical Attendance Logs */}
      <div className="glass-card p-6 md:p-8 border border-white/60">
         <div className="mb-8">
           <h2 className="text-[22px] font-black text-slate-800 tracking-tighter mb-1">Attendance History</h2>
           <p className="text-[13px] text-slate-500 font-bold tracking-tight">Log of all previously recorded check-ins</p>
         </div>
         
         <div className="w-full">
           <div className="grid grid-cols-12 gap-4 text-[11px] font-black text-orange-900/40 uppercase tracking-widest border-b border-orange-900/10 pb-3 mb-3 px-3">
             <div className="col-span-4">Employee Name</div>
             <div className="col-span-3">Date</div>
             <div className="col-span-2">Status</div>
             <div className="col-span-3 text-right">Check-in Time</div>
           </div>

           {attendance.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-[14px]">No historical records found. Check in above!</div>
           ) : (
            <div>
              {attendance.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 text-[13px] items-center py-4 px-3 rounded-[20px] bg-white/40 shadow-sm border border-white/60 hover:bg-white/60 transition-all cursor-pointer mb-3">
                  <div className="col-span-4 flex items-center gap-3 font-bold text-slate-800">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[12px] shadow-inner">{row.employeeId?.name?.[0] || 'U'}</div>
                    {row.employeeId?.name || 'Unknown User'}
                  </div>
                  <div className="col-span-3 font-semibold text-slate-500">{new Date(row.date).toLocaleDateString()}</div>
                  <div className="col-span-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      row.status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="col-span-3 text-right font-bold text-slate-600">
                    {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
           )}
         </div>
      </div>

    </div>
  );
};

export default Attendance;
