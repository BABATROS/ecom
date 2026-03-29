import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Ticket, PlusCircle, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

const OwnerCouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // ป้องกันการกดปุ่มซ้ำ

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
      const res = await axios.get('https://ecom-ghqt.onrender.com/api/orders');
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

    // 1. Validation ป้องกันข้อมูลไม่ครบก่อนส่งไปหลังบ้าน
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
      // 2. จัดระเบียบข้อมูลให้ตรงกับที่ Backend ต้องการเป๊ะๆ
      const payload = {
        code: code.trim().toUpperCase(), // บังคับเป็นตัวพิมพ์ใหญ่
        discountType: discountType,
        discountValue: discountType === 'free_shipping' ? 0 : Number(discountValue),
        minCartTotal: Number(minCartTotal) || 0
      };

      await axios.post('https://ecom-ghqt.onrender.com/api/orders', payload);

      // 3. จัดการเมื่อสำเร็จ
      setIsError(false);
      setMessage('สร้างคูปองสำเร็จเรียบร้อยแล้ว!');
      
      // ล้างค่าในฟอร์ม
      setCode('');
      setDiscountValue('');
      setMinCartTotal('0');
      
      // โหลดข้อมูลคูปองใหม่มาแสดงทันที
      fetchCoupons();

    } catch (err) {
      console.error('Create error:', err);
      setIsError(true);
      // ดึงข้อความ Error จาก Backend มาแสดงให้คนใช้รู้สาเหตุ
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อกับ Server ได้';
      setMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Ticket className="text-blue-600" size={36} />
              COUPON STUDIO
            </h1>
            <p className="text-slate-500 mt-2 font-medium">จัดการส่วนลดและโปรโมชั่นสำหรับร้านค้าของคุณ</p>
          </div>
          <Link to="/owner-dashboard" className="text-blue-600 hover:text-blue-800 font-bold transition flex items-center gap-2">
            ← กลับไปหน้าสินค้า
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ฝั่งซ้าย: ฟอร์มสร้างคูปอง */}
          <div className="lg:col-span-5">
            <form onSubmit={handleCreateCoupon} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                <PlusCircle size={22} className="text-blue-500" />
                CREATE NEW COUPON
              </h2>

              {/* ส่วนแสดงข้อความแจ้งเตือน */}
              {message && (
                <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 ${isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                  {isError ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={20} className="shrink-0 mt-0.5" />}
                  <p className="font-bold text-sm">{message}</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER2024"
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-black uppercase text-slate-700 transition"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
                    <select
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 transition"
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(e.target.value);
                        if(e.target.value === 'free_shipping') setDiscountValue('');
                      }}
                    >
                      <option value="amount">ลดเป็นเงิน (฿)</option>
                      <option value="percent">ลดเปอร์เซ็นต์ (%)</option>
                      <option value="free_shipping">จัดส่งฟรี</option>
                    </select>
                  </div>

                  {/* ซ่อนช่องใส่ค่าลดราคา ถ้าเลือกเป็นจัดส่งฟรี */}
                  {discountType !== 'free_shipping' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Value</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder={discountType === 'percent' ? "e.g. 10" : "e.g. 100"}
                        className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 transition"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Cart Total (฿)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000 (0 = ไม่มีขั้นต่ำ)"
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 transition"
                    value={minCartTotal}
                    onChange={(e) => setMinCartTotal(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black mt-8 hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'กำลังสร้าง...' : 'CREATE COUPON'}
              </button>
            </form>
          </div>

          {/* ฝั่งขวา: รายการคูปอง */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
              <ClipboardList size={22} className="text-slate-400" />
              ACTIVE COUPONS
            </h3>
            
            {loading ? (
              <div className="p-10 text-center text-slate-500 font-bold bg-slate-100 rounded-[2rem] animate-pulse">
                กำลังโหลดข้อมูลคูปอง...
              </div>
            ) : coupons && coupons.length > 0 ? (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div key={coupon._id} className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xl font-black uppercase tracking-tight text-blue-600">{coupon.code}</p>
                        <p className="text-slate-500 font-semibold mt-1">
                          {coupon.discountType === 'free_shipping'
                            ? '✅ จัดส่งฟรี' 
                            : coupon.discountType === 'percent'
                              ? `💸 ลด ${coupon.discountValue}%`
                              : `💸 ลด ${coupon.discountValue} บาท`}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-xl bg-slate-100 text-slate-600 px-4 py-2 text-sm font-bold border border-slate-200">
                        ขั้นต่ำ ฿{coupon.minCartTotal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500 font-bold">
                ยังไม่มีคูปองที่เปิดใช้งานในระบบ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerCouponManager;