import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Tag, ArrowLeft, Loader2, Copy, CheckCircle, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CouponCenter = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  const API_URL = 'https://ecom-ghqt.onrender.com/api/coupons';

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/available`);
      // กรองเฉพาะคูปองที่ยัง isActive และไม่หมดอายุ (ถ้า Backend ส่งมา)
      const activeCoupons = Array.isArray(res.data) 
        ? res.data.filter(c => c.isActive !== false) 
        : [];
      setCoupons(activeCoupons);
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Scanning Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-red-600 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-3 text-zinc-500 hover:text-white mb-16 transition-all font-black uppercase text-[10px] tracking-[0.4em]"
        >
          <div className="bg-zinc-900 p-2 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all">
            <ArrowLeft size={14} />
          </div> 
          BACK TO DROP
        </button>

        {/* Header Section */}
        <div className="relative mb-24 text-center md:text-left">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 blur-[100px] rounded-full"></div>
          <h1 className="relative text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-none">
            REWARD <span className="text-red-600">HUB</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6">
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] bg-zinc-900 px-4 py-2 rounded-full inline-block">
              Exclusive Access for SNKR Head
            </p>
            <span className="hidden md:block w-12 h-[1px] bg-zinc-800"></span>
            <p className="text-zinc-600 font-medium text-sm italic">Copy code & apply at checkout to save big.</p>
          </div>
        </div>

        {/* Coupon Grid */}
        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {coupons.map((coupon) => (
              <div 
                key={coupon._id} 
                className="group relative bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-[3rem] p-1 shadow-2xl transition-all duration-500 hover:border-red-600/50 hover:-translate-y-2"
              >
                {/* Inner Content */}
                <div className="relative bg-zinc-900/80 rounded-[2.8rem] p-10 overflow-hidden">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Zap size={100} />
                  </div>
                  
                  {/* Ticket Notches */}
                  <div className="absolute top-1/2 -left-6 w-12 h-12 bg-black rounded-full border border-zinc-800 -translate-y-1/2 z-10 shadow-inner"></div>
                  <div className="absolute top-1/2 -right-6 w-12 h-12 bg-black rounded-full border border-zinc-800 -translate-y-1/2 z-10 shadow-inner"></div>

                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest mb-2">
                        <Zap size={12} fill="currentColor" /> Limited Drop
                      </div>
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter group-hover:text-red-600 transition-colors">
                        {coupon.code}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-black italic text-white tracking-tighter leading-none">
                        {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : 
                         coupon.discountType === 'amount' ? `฿${coupon.discountValue}` : 'FREE'}
                      </p>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2 border-t border-zinc-800 pt-1">
                        {coupon.discountType === 'free_shipping' ? 'Shipping' : 'Off Order'}
                      </p>
                    </div>
                  </div>

                  {/* Dashed Line Divider */}
                  <div className="border-t-2 border-dashed border-zinc-800 my-8 relative">
                     <div className="absolute -top-[1px] left-0 w-full border-t-2 border-dashed border-black opacity-50"></div>
                  </div>

                  <div className="flex items-end justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
                        <Clock size={12} /> Expiry: No Limit
                      </div>
                      <p className="text-zinc-400 text-xs font-bold uppercase tracking-tighter">
                        Min. Spend <span className="text-white">฿{coupon.minCartTotal?.toLocaleString()}</span>
                      </p>
                    </div>

                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      className={`relative z-20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 overflow-hidden shadow-xl active:scale-95 ${
                        copiedCode === coupon.code 
                        ? 'bg-green-600 text-white shadow-green-900/20' 
                        : 'bg-white text-black hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {copiedCode === coupon.code ? (
                        <><CheckCircle size={16} /> Copied</>
                      ) : (
                        <><Copy size={16} /> Copy Code</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State - Styled as a locked vault */
          <div className="text-center py-40 bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-zinc-800/50 backdrop-blur-sm">
             <div className="bg-zinc-900 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-2xl">
                <Tag className="text-zinc-700" size={40} />
             </div>
             <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-500 mb-2">Vault is Sealed</h2>
             <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px]">
               No active coupons found. Check back after next drop.
             </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-24 p-12 bg-zinc-900/20 rounded-[3rem] border border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-red-600/10 rounded-2xl text-red-600">
                 <Zap size={32} />
              </div>
              <div>
                 <p className="font-black italic uppercase text-lg leading-none">Pro Tip</p>
                 <p className="text-zinc-500 text-xs mt-1 font-medium">Stack these with seasonal sales for maximum impact.</p>
              </div>
           </div>
           <button onClick={() => navigate('/')} className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Go Shopping
           </button>
        </div>
      </div>
    </div>
  );
};

export default CouponCenter;