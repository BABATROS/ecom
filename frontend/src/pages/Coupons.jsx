import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Zap, ArrowLeft, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  const API_URL = 'https://ecom-ghqt.onrender.com/api/coupons/available';

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get(API_URL);
        // 🟢 ปรับให้ดึงข้อมูลได้ชัวร์ๆ ไม่ว่าหลังบ้านจะส่งมาทรงไหน
        const couponData = Array.isArray(res.data) ? res.data : (res.data.coupons || res.data.data || []);
        setCoupons(couponData);
      } catch (err) {
        console.error("Error fetching coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    // คืนค่าปุ่มหลังจาก 2 วินาที
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-red-600">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-16">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.4em]"
          >
            <div className="bg-zinc-900 p-2 rounded-full group-hover:bg-red-600 transition-colors">
              <ArrowLeft size={16} />
            </div>
            Back to Drop
          </button>
          
          <div className="flex flex-col items-end">
             <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white leading-none uppercase">
               COUPON <span className="text-red-600">CENTER</span>
             </h1>
             <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-2 italic">Exclusive rewards for members</p>
          </div>
        </div>

        {/* Coupon Grid */}
        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coupons.map((coupon) => {
              // 🟢 ดักจับชื่อตัวแปรให้ตรงกับ Database 
              const discountType = coupon.type || coupon.discountType;
              const discountValue = coupon.value || coupon.discountValue || 0;
              const minSpend = coupon.minPurchase || coupon.minCartTotal || 0;

              return (
                <div 
                  key={coupon._id} 
                  className="relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-[2.5rem] p-8 overflow-hidden group hover:border-red-600/50 transition-all duration-500 shadow-2xl"
                >
                  {/* Ticket Notches */}
                  <div className="absolute top-1/2 -left-5 w-10 h-10 bg-black rounded-full border border-zinc-800 -translate-y-1/2 shadow-inner"></div>
                  <div className="absolute top-1/2 -right-5 w-10 h-10 bg-black rounded-full border border-zinc-800 -translate-y-1/2 shadow-inner"></div>

                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="bg-red-600 p-4 rounded-[1.5rem] text-white shadow-lg shadow-red-900/20 group-hover:rotate-12 transition-transform duration-500">
                        <Ticket size={30} />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                          {coupon.code}
                        </h3>
                        <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
                          {discountType === 'free_shipping' ? 'Free Shipping' : 
                           discountType === 'percent' ? `Save ${discountValue}%` : 
                           `Save ฿${discountValue}`}
                        </p>
                        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.1em]">
                          Min. Spend: ฿{minSpend.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      className={`relative px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-90 shadow-xl ${
                        copiedCode === coupon.code 
                        ? 'bg-green-600 text-white shadow-green-900/40' 
                        : 'bg-white text-black hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {copiedCode === coupon.code ? (
                        <span className="flex items-center gap-2 animate-in zoom-in-50">
                          <CheckCircle2 size={14} /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Copy size={14} /> Collect
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Decorative Line */}
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State - Styled with more impact */
          <div className="text-center py-32 bg-zinc-900/20 rounded-[4rem] border-2 border-dashed border-zinc-800/50">
             <div className="bg-zinc-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-2xl group">
                <Zap className="text-zinc-700 group-hover:text-red-600 transition-colors" size={40} fill="currentColor" />
             </div>
             <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-500 mb-2">The Vault is Empty</h2>
             <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px]">
                Check back later for the next limited drop.
             </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-20 p-8 border-t border-zinc-900 flex justify-center">
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em] text-center">
              SNKR HUB // UNLOCKING THE STREETS
            </p>
        </div>
      </div>
    </div>
  );
};

export default Coupons;