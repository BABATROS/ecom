import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        // ✅ แก้ไข Path จาก /orders/ เป็น /coupons/ ให้ตรงกับที่ตั้งไว้ใน server.js
        const res = await axios.get('https://ecom-ghqt.onrender.com/api/coupons/available');
        // ตรวจสอบข้อมูลก่อน set state
        setCoupons(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const collectCoupon = (code) => {
    navigator.clipboard.writeText(code);
    alert(`คัดลอกโค้ด ${code} แล้ว! นำไปใช้ในหน้าชำระเงินได้เลย`);
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto text-white">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <h1 className="text-3xl font-black italic text-red-600">COUPON CENTER</h1>
        <div className="w-10"></div>
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-20 italic uppercase tracking-widest font-bold">
          กำลังโหลดคูปอง...
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex items-center justify-between overflow-hidden group hover:border-red-600/50 transition-all">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border-r border-zinc-800"></div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border-l border-zinc-800"></div>

              <div className="flex items-center space-x-6">
                <div className="bg-red-600/10 p-4 rounded-2xl text-red-500">
                  <Ticket size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{coupon.code}</h3>
                  <p className="text-zinc-400 font-medium">
                    {coupon.discountType === 'free_shipping' ? 'Free Shipping' : 
                     coupon.discountType === 'percent' ? `Discount ${coupon.discountValue}%` : 
                     `Discount ฿${coupon.discountValue}`}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => collectCoupon(coupon.code)}
                className="bg-white text-black font-black px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition shadow-lg"
              >
                COLLECT
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-[3rem]">
          <Zap size={48} className="mx-auto text-zinc-800 mb-6" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest italic">
            ยังไม่มีคูปองว่างในขณะนี้ ลองกลับมาดูใหม่วันหลังนะ!
          </p>
        </div>
      )}
    </div>
  );
};

export default Coupons;