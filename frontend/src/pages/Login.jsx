import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ✅ แก้ไข URL ให้ถูกต้อง (เอา /orders ออก)
      const apiUrl = 'https://ecom-ghqt.onrender.com/api/auth/login';
      const res = await axios.post(apiUrl, { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      const { token, user } = res.data; 
      const role = user?.role || res.data?.role || 'User';

      // 🔐 เก็บข้อมูลลง LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      const userData = {
        id: user?.id || user?._id || '',
        username: user?.username || '',
        email: user?.email || '',
        profileImage: user?.profileImage || '',
        role: role
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // ✅ จัดการเส้นทางตาม Role
      if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'ShopOwner') {
        navigate('/owner-dashboard'); 
      } else {
        navigate('/'); 
      }
      
      alert('Login Success!');
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      alert(err.response?.data?.msg || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6 text-white">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 w-full max-w-md shadow-2xl">
        <header className="mb-8">
          <h2 className="text-4xl font-black italic text-red-600 tracking-tighter uppercase">Login</h2>
          <p className="text-zinc-500 text-sm mt-2">Welcome back to the Sneaker Vault.</p>
        </header>
        
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-zinc-500" size={20} />
            <input 
              type="email" placeholder="Email Address" 
              required
              className="w-full bg-zinc-800 p-3.5 pl-12 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition text-white"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-zinc-500" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              className="w-full bg-zinc-800 p-3.5 pl-12 pr-12 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition text-white"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-red-600 hover:text-white transition mb-8 flex items-center justify-center space-x-2">
          <LogIn size={20} />
          <span>ENTER THE VAULT</span>
        </button>

        <div className="flex justify-between text-sm font-medium border-t border-zinc-800 pt-6">
          <Link to="/register" className="text-zinc-500 hover:text-white transition">
            Create Account
          </Link>
          <Link to="/forgot-password" size={22} className="text-zinc-500 hover:text-white transition">
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;