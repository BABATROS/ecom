import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ChevronLeft, Send, Loader2, MailCheck, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ แนะนำให้เช็ค Path ที่ Server อีกครั้ง ปกติควรเป็น /api/users/ หรือ /api/auth/
      await axios.post('https://ecom-ghqt.onrender.com/api/users/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || 'โปรดลองอีกครั้งในภายหลัง'));
    } finally {
      setLoading(false);
    }
  };

  // หน้าจอเมื่อส่งสำเร็จ
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[85vh] p-6 bg-black">
        <div className="bg-zinc-900 p-12 rounded-[3rem] border border-zinc-800 w-full max-w-md text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          <div className="bg-red-600/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <MailCheck size={40} className="text-red-600" />
          </div>
          <h2 className="text-3xl font-black italic text-white mb-4 uppercase tracking-tighter">CHECK YOUR INBOX</h2>
          <p className="text-zinc-500 text-sm font-medium mb-10 leading-relaxed">
            หากอีเมล <span className="text-white font-bold">{email}</span> มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้คุณเรียบร้อยแล้ว
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all tracking-widest text-xs uppercase"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] p-6 bg-black selection:bg-red-600">
      <div className="relative group w-full max-w-md">
        {/* Decorative Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-zinc-800 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-zinc-900 p-10 md:p-12 rounded-[3rem] border border-zinc-800 w-full shadow-2xl">
          
          <Link to="/login" className="inline-flex items-center text-zinc-600 hover:text-red-600 mb-10 transition-colors text-[10px] font-black uppercase tracking-[0.3em]">
            <ChevronLeft size={14} className="mr-1" /> Back to Login
          </Link>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <KeyRound size={24} className="text-red-600" />
              <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-none">
                FORGOT <br /> <span className="text-red-600">PASSWORD?</span>
              </h2>
            </div>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-4">
              Enter your email to secure your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <input 
                type="email" 
                placeholder="sneakerhead@example.com" 
                required
                disabled={loading}
                className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all font-bold placeholder:text-zinc-700"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="group w-full bg-red-600 text-white py-5 rounded-2xl font-black italic tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center space-x-3 shadow-xl shadow-red-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>SEND RESET LINK</span>
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-800 text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-600 uppercase font-black text-[9px] tracking-[0.2em]">
              <ShieldCheck size={12} /> Secure Authentication System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;