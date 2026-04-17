import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';
import api from '../lib/api';

const Directory = () => {
  const [employees, setEmployees] = useState([]);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim().toLowerCase();

  useEffect(() => {
    api.get('/api/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!query) return employees;
    return employees.filter((emp) => {
      const haystack = [
        emp.name,
        emp.role,
        emp.department,
        emp.email,
        emp.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [employees, query]);

  return (
    <div className="flex flex-col gap-5 w-full pb-10 animate-in fade-in duration-500 lg:pr-6">
      <div className="glass-card p-6 md:p-8 flex items-center justify-between">
         <div>
            <h2 className="text-[22px] font-black text-slate-800 tracking-tighter mb-1">Teams</h2>
            <p className="text-[13px] text-slate-500 font-bold tracking-tight">
              {query ? `Showing results for "${searchParams.get('q')}"` : 'Manage and view your team members'}
            </p>
         </div>
         <button className="bg-primary text-white font-bold text-[13px] px-6 py-3 rounded-xl shadow-[0_4px_15px_rgba(43,134,254,0.3)] hover:bg-orange-600 transition-colors">
            + Add Employee
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((emp, i) => (
          <div key={i} className="glass-card overflow-hidden hover:-translate-y-1 transition-all">
             <div className="h-20 bg-gradient-to-r from-orange-400 to-primary"></div>
             <div className="px-6 pb-6">
               <div className="-mt-8 mb-4">
                 <div className="w-16 h-16 rounded-full border-[4px] border-white/60 bg-orange-100 backdrop-blur-md flex items-center justify-center text-primary font-black text-xl shadow-md">
                   {emp.name[0]}
                 </div>
               </div>

               <div>
                 <h3 className="text-lg font-black text-slate-800">{emp.name}</h3>
                 <p className="text-[12px] font-extrabold text-orange-600 tracking-wider uppercase mb-4">{emp.role}</p>
                 
                 <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500">
                     <Mail size={14} className="text-slate-400" /> {emp.email}
                   </div>
                   <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500">
                     <MapPin size={14} className="text-slate-400" /> {emp.department} Dept.
                   </div>
                 </div>

                 <div className="mt-5 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${emp.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{emp.status}</span>
                   <button className="text-[12px] font-bold text-primary hover:underline">View Profile</button>
                 </div>
               </div>
             </div>
          </div>
        ))}
        {filteredEmployees.length === 0 && <div className="text-slate-400 font-bold p-6">{query ? 'No matching employees found.' : 'No employees found in directory.'}</div>}
      </div>
    </div>
  );
};

export default Directory;
