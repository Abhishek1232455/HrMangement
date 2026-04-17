import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = useCallback(() => {
    api.get('/api/leaves')
      .then(res => setLeaves(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/api/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-10 animate-in fade-in duration-500 lg:pr-6">
      <div className="glass-card p-6 md:p-8 flex items-center justify-between">
         <div>
            <h2 className="text-[22px] font-black text-slate-800 tracking-tighter mb-1">Leave Hub</h2>
            <p className="text-[13px] text-slate-500 font-bold tracking-tight">Approve or reject team leaves</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leaves.map((leave, i) => (
          <div key={i} className="glass-card p-6 border-l-[6px] border-l-primary relative">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-lg font-black text-slate-800">{leave.employeeId?.name}</h3>
                  <span className="text-[11px] font-extrabold uppercase text-slate-400">{leave.employeeId?.department}</span>
               </div>
               <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${leave.status === 'Approved' ? 'bg-green-100 text-green-600' : leave.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>{leave.status}</span>
             </div>

             <div className="mb-4">
               <div className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded inline-block mb-2">{leave.type} Leave</div>
               <p className="text-[13px] font-bold text-slate-600 tracking-tight">{new Date(leave.from).toLocaleDateString()} - {new Date(leave.to).toLocaleDateString()}</p>
             </div>

             <div className="bg-white/40 p-3 rounded-xl border border-white/60 mb-5">
               <p className="text-[12px] text-slate-500 italic">" {leave.reason} "</p>
             </div>

             {leave.status === 'Pending' && (
               <div className="flex gap-3">
                 <button onClick={() => handleStatusUpdate(leave._id, 'Approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-[13px] py-2.5 rounded-xl transition-colors shadow-sm">Approve</button>
                 <button onClick={() => handleStatusUpdate(leave._id, 'Rejected')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[13px] py-2.5 rounded-xl transition-colors">Reject</button>
               </div>
             )}
          </div>
        ))}
        {leaves.length === 0 && <div className="text-slate-400 font-bold p-6">No leave requests found.</div>}
      </div>
    </div>
  );
};

export default Leaves;
