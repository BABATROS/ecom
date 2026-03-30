import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Ticket, PlusCircle, ClipboardList, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const OwnerCouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('amount');
  const [discountValue, setDiscountValue] = useState('');
  const [minCartTotal, setMinCartTotal] = useState('0');

  // Status Message States
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // 🟢 เปลี่ยน URL เป็น /api/coupons
      const res = await axios.get('https://ecom-ghqt.onrender.com/api/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data || []);
    } catch (err) {
      console.error('Fetch coupons error:', err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!code.trim()) {
      setIsError(true);
      setMessage('กรุณากรอกรหัสคูปอง');
      return;
    }

    if (discountType !== 'free_shipping' && (!discountValue || Number(discountValue) <= 0)) {
      setIsError(true);
      setMessage('กรุณากรอกมูลค่าส่วนลดให้มากกว่า 0');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        code: code.trim().toUpperCase(),
        discountType: discountType,
        discountValue: discountType === 'free_shipping' ? 0 : Number(discountValue),
        minCartTotal: Number(minCartTotal) || 0
      };

      // 🟢 เปลี่ยน URL เป็น /api/coupons และใส่ Header
      await axios.post('https://ecom-ghqt.onrender.com/api/coupons', payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setIsError(false);
      setMessage('สร้างคูปองสำเร็จเรียบร้อยแล้ว!');
      
      // ล้างค่าในฟอร์ม
      setCode('');
      setDiscountValue('');
      setMinCartTotal('0');
      
      fetchCoupons(); // รีโหลดข้อมูลใหม่

    } catch (err) {
      console.error('Create error:', err);
      setIsError(true);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'เกิดข้อผิดพลาดในการสร้างคูปอง';
      setMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-red-600 flex items-center gap-4 uppercase">
              <Ticket size={48} strokeWidth={3} />
              COUPON STUDIO
            </h1>
            <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-xs">Manage your store's explosive promotions</p>
          </div>
          <Link to="/owner-dashboard" className="group text-zinc-400 hover:text-white font-black transition-all flex items-center gap-2 uppercase text-xs tracking-tighter border-b border-zinc-800 hover:border-red-600 pb-1">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Warehouse
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ฝั่งซ้าย: Form */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 backdrop-blur-sm sticky top-28">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-white uppercase italic">
                <PlusCircle size={22} className="text-red-600" />
                Forge New Coupon
              </h2>

              {message && (
                <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${isError ? 'bg-red-600/10 text-red-500 border border-red-600/20' : 'bg-green-600/10 text-green-500 border border-green-600/20'}`}>
                  {isError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  <p className="font-black text-[11px] uppercase tracking-wider">{message}</p>
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em] ml-1">Unique Code</label>
                  <input
                    type="text"
                    required
                    placeholder="SNEAKER_HOT"
                    className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 font-black uppercase text-white transition-all placeholder:text-zinc-700"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em] ml-1">Benefit Type</label>
                    <select
                      className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 font-bold text-white transition-all appearance-none cursor-pointer"
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(e.target.value);
                        if(e.target.value === 'free_shipping') setDiscountValue('');
                      }}
                    >
                      <option value="amount">Cash Discount (฿)</option>
                      <option value="percent">Percentage (%)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  {discountType !== 'free_shipping' && (
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em] ml-1">Discount Value</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 font-black text-white transition-all"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-[0.2em] ml-1">Min. Spend (฿)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 font-black text-white transition-all"
                    value={minCartTotal}
                    onChange={(e) => setMinCartTotal(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-black mt-4 hover:bg-white hover:text-black transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                >
                  {submitting ? 'Forging...' : 'Activate Coupon'}
                </button>
              </form>
            </div>
          </div>

          {/* ฝั่งขวา: List */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white italic uppercase">
              <ClipboardList size={22} className="text-zinc-600" />
              Active Explosives
            </h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-zinc-900 rounded-3xl animate-pulse border border-zinc-800"></div>)}
              </div>
            ) : coupons && coupons.length > 0 ? (
              <div className="grid gap-4">
                {coupons.map((coupon) => (
                  <div key={coupon._id} className="group relative overflow-hidden rounded-3xl bg-zinc-900/30 p-8 border border-zinc-800 hover:border-red-600/50 transition-all">
                    {/* Ticket Cut-outs (Decoration) */}
                    <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-black border-r border-zinc-800"></div>
                    <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-black border-l border-zinc-800"></div>
                    
                    <div className="flex items-center justify-between gap-6 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-3xl font-black uppercase tracking-tighter text-red-600 italic">{coupon.code}</p>
                          <span className="text-[10px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-widest">Active</span>
                        </div>
                        <p className="text-zinc-400 font-bold text-sm uppercase tracking-tight">
                          {coupon.discountType === 'free_shipping'
                            ? '🚀 No Shipping Cost' 
                            : coupon.discountType === 'percent'
                              ? `⚡ ${coupon.discountValue}% OFF Total`
                              : `💰 ฿${coupon.discountValue} Instant Rebate`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Threshold</p>
                        <p className="text-lg font-black text-white italic">฿{coupon.minCartTotal}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[3rem] border-2 border-dashed border-zinc-800 bg-zinc-900/10 p-20 text-center">
                <Ticket size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                <p className="text-zinc-600 font-black uppercase tracking-widest text-sm italic">Zero Active Coupons Found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerCouponManager;