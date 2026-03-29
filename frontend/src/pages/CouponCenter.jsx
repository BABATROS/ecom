import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Tag, ArrowLeft, Loader2, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CouponCenter = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  // URL ของ API บน Render
  const API_URL = 'https://ecom-ghqt.onrender.com/api/coupons';

  const fetchCoupons = async () => {
    try {
      // ดึงข้อมูลจาก /available ตาม Logic ใน Backend
      const res = await axios.get(`${API_URL}/available`);
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch coupons error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-red-600">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-all font-black uppercase text-[10px] tracking-[0.3em]"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO STORE
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none mb-4">
            COUPON <span className="text-red-600">CENTER</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Unlock exclusive deals for your next pair</p>
        </div>

        {/* Coupon Grid */}
        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coupons.map((coupon) => (
              <div 
                key={coupon._id} 
                className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-[2.5rem] p-10 overflow-hidden group hover:border-red-600/50 transition-all shadow-2xl"
              >
                {/* Ticket Aesthetic Notches */}
                <div className="absolute top-1/2 -left-5 w-10 h-10 bg-black rounded-full border border-zinc-800 -translate-y-1/2 shadow-[inset_-5px_0_10px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute top-1/2 -right-5 w-10 h-10 bg-black rounded-full border border-zinc-800 -translate-y-1/2 shadow-[inset_5px_0_10px_rgba(0,0,0,0.5)]"></div>
                
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-red-600 p-4 rounded-3xl text-white rotate-[-10deg] group-hover:rotate-0 transition-transform shadow-lg shadow-red-900/40">
                    <Ticket size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black italic text-white tracking-tighter">
                      {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : 
                       coupon.discountType === 'amount' ? `฿${coupon.discountValue}` : 'FREE'}
                    </p>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1">
                      {coupon.discountType === 'free_shipping' ? 'SHIPPING' : 'DISCOUNT'}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-300 group-hover:text-white transition-colors">
                    {coupon.code}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-2">
                    Min. spend: ฿{coupon.minCartTotal?.toLocaleString() || '0'}
                  </p>
                </div>

                <button 
                  onClick={() => handleCopy(coupon.code)}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    copiedCode === coupon.code 
                    ? 'bg-green-600 text-white' 
                    : 'bg-zinc-800 hover:bg-white hover:text-black text-zinc-400'
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <><CheckCircle size={18} /> COPIED!</>
                  ) : (
                    <><Copy size={18} /> GET CODE</>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-32 bg-zinc-900/20 rounded-[4rem] border-2 border-dashed border-zinc-800">
             <div className="bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="text-zinc-600" size={32} />
             </div>
             <p className="text-zinc-500 font-black italic uppercase tracking-[0.2em] text-sm">
               No coupons available right now.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponCenter;