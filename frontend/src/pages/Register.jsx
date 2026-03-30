import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, UserCircle, ShieldCheck, Eye, EyeOff, Store, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const p1 = formData.password.trim();
    const p2 = formData.confirmPassword.trim();

    if (p1 !== p2) {
      alert('PASSWORDS DO NOT MATCH. Please check again.');
      return;
    }

    setLoading(true);
    try {
      // ปรับปรุงการส่งข้อมูลให้สะอาดขึ้น
      const submissionData = {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: p1
      };

      await axios.post('https://ecom-ghqt.onrender.com/api/auth/register', submissionData);
      
      alert('REGISTRATION SUCCESSFUL! WELCOME TO THE CREW.');
      navigate('/login');
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      alert(err.response?.data?.msg || 'REGISTRATION FAILED'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-6 selection:bg-red-600">
      <div className="w-full max-w-md">
        
        {/* Logo or Title Section */}
        <div className="text-center mb-10">
          <h2 className="text-6xl font-black italic text-white tracking-tighter uppercase leading-none">
            JOIN <span className="text-red-600">THE</span> HUB
          </h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-4 italic opacity-80">
            Identity Registration // System Access
          </p>
        </div>

        <form 
          onSubmit={handleRegister} 
          className="bg-zinc-900/40 backdrop-blur-xl p-10 rounded-[3rem] border border-zinc-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="space-y-5">
            
            {/* Username */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 italic">Username</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
                <input 
                  type="text" placeholder="THE_COLLECTOR" required
                  className="w-full bg-zinc-950/50 p-4 pl-14 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all text-white font-bold placeholder:text-zinc-800"
                  onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                />
              </div>
            </div>

            {/* Email */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 italic">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
                <input 
                  type="email" placeholder="USER@SNKRHUB.COM" required
                  className="w-full bg-zinc-950/50 p-4 pl-14 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all text-white font-bold placeholder:text-zinc-800"
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 italic">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" required
                  className="w-full bg-zinc-950/50 p-4 pl-14 pr-14 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all text-white font-bold placeholder:text-zinc-800"
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 italic">Verify Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={20} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" required
                  className="w-full bg-zinc-950/50 p-4 pl-14 pr-14 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all text-white font-bold placeholder:text-zinc-800"
                  onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Select - Enhanced UI */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 italic">Account Tier</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, role: 'User'}))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black italic text-xs transition-all border-2 ${formData.role === 'User' ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                >
                  <User size={14} /> CUSTOMER
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, role: 'ShopOwner'}))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black italic text-xs transition-all border-2 ${formData.role === 'ShopOwner' ? 'bg-white border-white text-black shadow-lg' : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                >
                  <Store size={14} /> MERCHANT
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black italic text-xl mt-10 hover:bg-white hover:text-black transition-all shadow-[0_15px_30px_rgba(220,38,38,0.3)] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              <>
                <UserPlus size={24} />
                <span>INITIALIZE ACCOUNT</span>
              </>
            )}
          </button>

          <p className="text-center mt-8 text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">
            Already a member? <Link to="/login" className="text-white hover:text-red-600 transition-colors underline decoration-red-600 underline-offset-4">Sign In Here</Link>
          </p>
        </form>
        
        {/* Footer info */}
        <p className="text-center mt-10 text-[9px] text-zinc-800 font-black uppercase tracking-[0.5em] italic">
          Secure Network // 256-Bit Encryption
        </p>
      </div>
    </div>
  );
};

export default Register;