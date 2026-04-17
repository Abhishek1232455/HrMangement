import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, CheckCircle2, Pencil } from 'lucide-react';
import api from '../lib/api';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Signup = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(0);
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const presetLogos = [
    "bg-gradient-to-br from-blue-400 to-blue-600",
    "bg-gradient-to-br from-orange-400 to-orange-600",
    "bg-gradient-to-br from-emerald-400 to-emerald-600",
    "bg-gradient-to-br from-purple-400 to-purple-600",
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await api.post('/api/auth/register', { 
        name, email, password 
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post('/api/auth/google', { token: tokenResponse.access_token });
        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.msg || 'Google signup failed');
      }
    },
    onError: () => setError('Google loop failed')
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative Blobs for deeper visual field */}
      <div className="absolute w-[600px] h-[600px] bg-white/50 blur-[100px] rounded-full -top-40 -left-20 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-orange-300/30 blur-[80px] rounded-full bottom-0 right-0 pointer-events-none"></div>

      {step === 1 ? (
        <div className="relative z-10 w-full max-w-md">
          
          {/* Popping Out Vertical Logo Picker */}
          <div className={`absolute top-1/2 -translate-y-1/2 flex flex-col bg-white/50 backdrop-blur-xl border border-white/70 p-4 rounded-full shadow-[0_8px_32px_rgba(249,115,22,0.15)] justify-center items-center gap-4 py-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0
            ${showLogoPicker ? 'left-[-90px] opacity-100 scale-100 pointer-events-auto' : 'left-0 opacity-0 scale-90 pointer-events-none'}`}
          >
            {presetLogos.map((bg, idx) => (
              <div 
                key={`desk-${idx}`} 
                onClick={() => { setSelectedLogo(idx); setTimeout(()=>setShowLogoPicker(false), 300); }}
                className={`w-11 h-11 rounded-full cursor-pointer transition-all border-[3px] flex items-center justify-center text-white relative group
                  ${selectedLogo === idx ? 'border-primary scale-110 shadow-[0_4px_15px_rgba(249,115,22,0.3)]' : 'border-white hover:scale-105 shadow-sm opacity-60'}
                  ${bg}
                `}
              >
                 {selectedLogo === idx && <CheckCircle2 size={16} className="text-white drop-shadow-md" />}
              </div>
            ))}
          </div>

          <div className="glass-card p-8 md:p-10 w-full max-w-md shadow-[0_8px_32px_rgba(249,115,22,0.15)] drop-shadow-sm border border-white/70 overflow-y-auto max-h-[95vh] custom-scrollbar relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-black text-primary tracking-tighter italic mb-1 drop-shadow-sm">1Clik</h2>
              <p className="text-orange-900/50 font-bold text-[12px] tracking-tight">One click. Total control</p>
            </div>
            
            {error && <div className="text-red-500 text-[12px] font-bold mb-4 text-center bg-red-100 p-2 rounded-2xl shadow-sm border border-red-200">{error}</div>}
            
            {/* Active Logo Button to Trigger Popout */}
            <div className="flex flex-col items-center mb-5">
              <div 
                onClick={() => setShowLogoPicker(!showLogoPicker)} 
                className={`w-[68px] h-[68px] rounded-full cursor-pointer transition-all border-[4px] border-white shadow-md flex items-center justify-center text-white relative group hover:scale-105 hover:shadow-lg ${presetLogos[selectedLogo]}`}
              >
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Pencil size={18} className="text-white" />
                </div>
                <span className="text-lg font-black drop-shadow-md">{name ? name[0].toUpperCase() : 'PF'}</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-extrabold text-orange-900/50 uppercase tracking-widest mb-1.5 pl-4">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white/50 backdrop-blur-xl border border-white/60 text-slate-800 text-[13px] font-bold h-[46px] rounded-[23px] px-5 outline-none focus:bg-white/70 transition-all shadow-sm placeholder:text-orange-900/30" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-orange-900/50 uppercase tracking-widest mb-1.5 pl-4">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-white/50 backdrop-blur-xl border border-white/60 text-slate-800 text-[13px] font-bold h-[46px] rounded-[23px] px-5 outline-none focus:bg-white/70 transition-all shadow-sm placeholder:text-orange-900/30" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-orange-900/50 uppercase tracking-widest mb-1.5 pl-4">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-white/50 backdrop-blur-xl border border-white/60 text-slate-800 text-[13px] font-bold h-[46px] rounded-[23px] px-5 outline-none focus:bg-white/70 transition-all shadow-sm placeholder:text-orange-900/30" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-orange-900/50 uppercase tracking-widest mb-1.5 pl-4">Confirm Password</label>
                <input 
                  type="password" 
                  className="w-full bg-white/50 backdrop-blur-xl border border-white/60 text-slate-800 text-[13px] font-bold h-[46px] rounded-[23px] px-5 outline-none focus:bg-white/70 transition-all shadow-sm placeholder:text-orange-900/30" 
                  placeholder="********" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full h-[46px] bg-primary text-white font-black text-[13px] uppercase tracking-widest rounded-[23px] shadow-[0_6px_15px_rgba(249,115,22,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(249,115,22,0.45)] transition-all">Sign Up</button>
              </div>
            </form>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/80"></div>
              <span className="flex-shrink-0 mx-4 text-orange-900/40 text-[10px] font-extrabold uppercase tracking-widest">Or create with</span>
              <div className="flex-grow border-t border-white/80"></div>
            </div>

            <button type="button" onClick={() => loginWithGoogle()} className="w-full h-[46px] bg-white/80 backdrop-blur-xl text-slate-700 font-extrabold text-[13px] rounded-[23px] flex items-center justify-center transition-all shadow-sm border border-white/80 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
              <GoogleIcon />
              <span>Sign Up with Google</span>
            </button>
            
            <div className="text-center mt-5 text-[12px] font-bold text-orange-900/60">
              Already have an account? <Link to="/login" className="text-primary hover:text-orange-600 transition-colors ml-1 font-extrabold">Sign in</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 md:p-12 w-full max-w-md relative z-10 text-slate-800 shadow-[0_8px_32px_rgba(249,115,22,0.15)] drop-shadow-sm border border-white/70 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-[4px] border-white">
              <Mail className="text-primary w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Check your email</h3>
            <p className="text-[14px] text-orange-900/60 font-bold mb-8 px-4 leading-relaxed">
              We've sent a verification link to <br/>
              <span className="text-primary">{email}</span>. <br/>
              Please click the link to verify your account!
            </p>
            
            <Link to="/login" className="w-full h-[46px] bg-white text-slate-800 font-black text-[13px] uppercase tracking-widest rounded-[23px] shadow-sm border border-white/80 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center">
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
