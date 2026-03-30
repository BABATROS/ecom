import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldOff } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ฟังก์ชันสำหรับล้างข้อมูลและ Redirect
    const performLogout = () => {
      // 1. ล้างข้อมูลทั้งหมดใน LocalStorage (Safe & Clean)
      localStorage.clear();

      // 2. ถ้าคุณใช้ SessionStorage ด้วยก็ล้างออกให้หมด
      sessionStorage.clear();

      // 3. หน่วงเวลาเล็กน้อยเพื่อให้ User เห็นความเคลื่อนไหวของ UI
      setTimeout(() => {
        navigate('/login', { replace: true }); // ใช้ replace: true เพื่อไม่ให้กดย้อนกลับมาหน้านี้ได้
      }, 1200);
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 selection:bg-red-600">
      <div className="relative group">
        {/* Background Glow */}
        <div className="absolute -inset-4 bg-red-600/10 blur-[60px] rounded-full animate-pulse"></div>
        
        <div className="relative flex flex-col items-center text-center space-y-8">
          {/* Icon Section */}
          <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group-hover:border-red-600/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <ShieldOff size={48} className="text-red-600 mb-2 animate-bounce" />
            <Loader2 className="animate-spin text-zinc-700 absolute bottom-4 right-4" size={20} />
          </div>

          {/* Text Section */}
          <div className="space-y-3">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              LOCKING THE <span className="text-red-600">VAULT</span>
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">
                Securing your session data...
              </p>
              <div className="w-24 h-[2px] bg-zinc-900 overflow-hidden relative rounded-full">
                <div className="absolute top-0 left-0 h-full bg-red-600 w-1/2 animate-[loading_1s_infinite_linear]"></div>
              </div>
            </div>
          </div>

          <p className="text-zinc-700 font-medium text-[11px] italic">
            Redirecting to authentication portal.
          </p>
        </div>
      </div>

      {/* Tailwind Custom Animation for the small bar */}
      <style jsx="true">{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default Logout;