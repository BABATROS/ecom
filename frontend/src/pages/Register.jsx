import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, UserCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });

  // State สำหรับเปิด-ปิดการมองเห็นรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const p1 = formData.password.trim();
    const p2 = formData.confirmPassword.trim();

    if (p1 !== p2) {
      alert('รหัสผ่านไม่ตรงกัน (โปรดตรวจสอบตัวพิมพ์เล็ก-ใหญ่ หรือช่องว่าง)');
      return;
    }

    try {
      await axios.post('https://ecom-ghqt.onrender.com/api/auth/register', formData);
      
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      alert(err.response?.data?.msg || 'Registration Failed'); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] p-6">
      <form onSubmit={handleRegister} className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 w-full max-w-md shadow-2xl">
        <header className="mb-8 text-center sm:text-left">
          <h2 className="text-4xl font-black italic text-red-600 tracking-tighter uppercase">Join The Hub</h2>
          <p className="text-zinc-500 text-sm mt-2">Create your account to start collecting sneakers.</p>
        </header>

        <div className="space-y-4">
          {/* Username */}
          <div className="relative">
            <UserCircle className="absolute left-3 top-3.5 text-zinc-500" size={20} />
            <input 
              type="text" placeholder="Username" required
              className="w-full bg-zinc-800 p-3.5 pl-12 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition text-white"
              onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-zinc-500" size={20} />
            <input 
              type="email" placeholder="Email Address" required
              className="w-full bg-zinc-800 p-3.5 pl-12 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition text-white"
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-zinc-500" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" required
              className="w-full bg-zinc-800 p-3.5 pl-12 pr-12 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition text-white"
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
            />
            <button 
              type="button"
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-3.5 text-zinc-500" size={20} />
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" required
              className="w-full bg-zinc-800 p-3.5 pl-12 pr-12 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition text-white"
              onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
            />
            <button 
              type="button"
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Role Select */}
          <div>
            <label className="text-xs text-zinc-500 ml-1 mb-1 block uppercase font-bold text-[10px]">Account Type</label>
            <select 
              className="w-full bg-zinc-800 p-3.5 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition text-zinc-300"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
            >
              <option value="User">Customer</option>
              <option value="ShopOwner">Shop Owner</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black mt-8 hover:bg-red-600 hover:text-white transition flex items-center justify-center space-x-2">
          <UserPlus size={20} />
          <span>CREATE ACCOUNT</span>
        </button>

        <p className="text-center mt-6 text-zinc-500 text-sm">
          Already have an account? <Link to="/login" className="text-white hover:underline font-bold">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;