import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('profileImage');
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        <p className="text-xl font-bold mb-2">กำลังออกจากระบบ...</p>
        <p className="text-zinc-400">กรุณารอสักครู่ แล้วคุณจะถูกพาไปยังหน้าลงชื่อเข้าใช้</p>
      </div>
    </div>
  );
};

export default Logout;
