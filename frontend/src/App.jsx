import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Directory from './pages/Directory';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import ProtectedRoute from './components/ProtectedRoute';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="directory" element={<Directory />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="analytics" element={<div className="glass-card p-6 md:p-8"><h2 className="text-[22px] font-black text-slate-800 tracking-tighter mb-1">Analytics</h2><p className="text-slate-500 font-bold text-[13px]">Coming in v2.0</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
