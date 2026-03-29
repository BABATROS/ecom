import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { KeyRound, ChevronLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ecom-ghqt.onrender.com/api/orders/forgot-password', { email });
      alert('หากมีอีเมลนี้ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้ครับ');
    } catch (err) {
      alert('เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6">
      <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 w-full max-w-md">
        <Link to="/login" className="flex items-center text-zinc-500 hover:text-white mb-6 transition text-sm">
          <ChevronLeft size={16} className="mr-1" /> Back to Login
        </Link>

        <h2 className="text-3xl font-black italic text-white mb-2">FORGOT PASSWORD?</h2>
        <p className="text-zinc-500 text-sm mb-8">Enter your email and we'll send you a link to reset your password.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="email" placeholder="Enter your email" required
            className="w-full bg-zinc-800 p-4 rounded-xl outline-none border border-zinc-700 focus:border-red-600 transition"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition flex items-center justify-center space-x-2 shadow-lg shadow-red-600/20">
            <Send size={18} />
            <span>SEND RESET LINK</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;