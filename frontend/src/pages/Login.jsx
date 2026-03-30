import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = 'https://ecom-ghqt.onrender.com/api/auth/login';
      const res = await axios.post(apiUrl, { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      const { token, user } = res.data; 
      
      // 1. ดึง Role ออกมาเช็ค (รองรับโครงสร้างข้อมูลหลายแบบจาก Backend)
      const rawRole = user?.role || res.data?.role || 'User';
      
      // 2. จัดเก็บข้อมูลลง LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', rawRole); // เก็บแบบ Original ไว้เช็ค

      const userData = {
        id: user?.id || user?._id || '',
        username: user?.username || '',
        email: user?.email || '',
        profileImage: user?.profileImage || '',
        role: rawRole // 📍 ตำแหน่งสำคัญ: ใส่ Role ลงในก้อน User
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // 3. ✅ จัดการเส้นทางตาม Role (ใช้ .toLowerCase() เพื่อความชัวร์)
      const lowerRole = rawRole.toLowerCase();

      if (lowerRole === 'admin') {
        navigate('/owner-dashboard'); // หรือหน้าที่คุณตั้งไว้สำหรับ Admin
      } else if (lowerRole === 'shopowner') {
        // ส่งผู้ขายไปหน้า Dashboard ของเขา
        navigate('/owner-dashboard'); 
      } else {
        navigate('/'); 
      }
      
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      alert(err.response?.data?.msg || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] p-6 bg-black selection:bg-red-600">
      <div className="relative w-full max-w-md group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-zinc-900 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

        <form 
          onSubmit={handleLogin} 
          className="relative bg-zinc-900/90 backdrop-blur-xl p-10 md:p-12 rounded-[3rem] border border-zinc-800 w-full shadow-2xl overflow-hidden"
        >
          <header className="mb-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-red-600">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Secure Access</span>
            </div>
            <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
              LOG<span className="text-red-600">IN</span>
            </h2>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-4">Welcome back to the Sneaker Vault.</p>
          </header>
          
          <div className="space-y-5 mb-8">
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  required
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 pl-12 outline-none focus:border-red-600 transition-all text-sm font-bold placeholder:text-zinc-800"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 pl-12 pr-12 outline-none focus:border-red-600 transition-all text-sm font-bold placeholder:text-zinc-800"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 text-white py-5 rounded-2xl font-black italic tracking-widest hover:bg-white hover:text-black transition-all transform active:scale-95 flex items-center justify-center space-x-3 shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} />
                <span>ENTER THE VAULT</span>
              </>
            )}
          </button>

          <div className="mt-10 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <Link to="/register" className="text-zinc-600 hover:text-white transition-colors underline decoration-red-600/30 underline-offset-4">
              Create Account
            </Link>
            <Link to="/forgot-password" size={22} className="text-zinc-600 hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;