import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, CreditCard, Tag } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]); // ดึงมาจาก localStorage หรือ Context
  const [address, setAddress] = useState({ name: '', phone: '', detail: '' });
  const [paymentMethod, setPaymentMethod] = useState('Transfer');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // 1. ดึงข้อมูลตะกร้าสินค้าตอนโหลดหน้า
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (savedCart.length === 0) {
      alert("ตะกร้าว่างเปล่า! ไปเลือกช้อปก่อนนะ");
      navigate('/');
    }
    setCart(savedCart);
  }, [navigate]);

  // 2. คำนวณยอดเงิน
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 50;
  const totalPrice = subTotal + shippingFee - discount;

  // 3. ฟังก์ชันตรวจสอบคูปอง
  const handleVerifyCoupon = async () => {
    try {
      const res = await api.post('/coupons/verify', { code: couponCode, cartTotal: subTotal });
      if (res.data.success) {
        const cp = res.data.coupon;
        let amount = 0;
        if (cp.discountType === 'amount') amount = cp.discountValue;
        if (cp.discountType === 'percent') amount = (subTotal * cp.discountValue) / 100;
        
        setDiscount(amount);
        setCouponMsg({ type: 'success', text: `ใช้คูปองสำเร็จ! ลดไป ฿${amount.toLocaleString()}` });
      }
    } catch (err) {
      setDiscount(0);
      setCouponMsg({ type: 'error', text: err.response?.data?.msg || 'คูปองใช้ไม่ได้' });
    }
  };

  // 4. ฟังก์ชันส่งคำสั่งซื้อ (เชื่อมกับ Backend /api/orders)
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          size: item.selectedSize, // ต้องมั่นใจว่าในตะกร้ามีฟิลด์นี้
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: discount > 0 ? couponCode : null
      };

      const res = await api.post('/orders', orderData);
      if (res.data.success) {
        localStorage.removeItem('cart'); // สั่งเสร็จเคลียร์ตะกร้า
        navigate(`/my-orders?id=${res.data.data._id}`); // ไปหน้าดูออเดอร์ของตัวเอง
      }
    } catch (err) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ฝั่งซ้าย: ข้อมูลที่อยู่และการชำระเงิน (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 italic">
              <Truck className="text-indigo-600" /> SHIPPING ADDRESS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" placeholder="ชื่อ-นามสกุล ผู้รับ" 
                className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={(e) => setAddress({...address, name: e.target.value})}
              />
              <input 
                type="text" placeholder="เบอร์โทรศัพท์" 
                className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={(e) => setAddress({...address, phone: e.target.value})}
              />
              <textarea 
                placeholder="ที่อยู่จัดส่งโดยละเอียด" 
                className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2 h-32"
                onChange={(e) => setAddress({...address, detail: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 italic">
              <CreditCard className="text-indigo-600" /> PAYMENT METHOD
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'Transfer' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
                onClick={() => setPaymentMethod('Transfer')}
              >
                <span className="font-bold">โอนเงิน (แจ้งสลิป)</span>
              </button>
              <button 
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'Cash on Delivery' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
                onClick={() => setPaymentMethod('Cash on Delivery')}
              >
                <span className="font-bold">เก็บเงินปลายทาง (COD)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: Order Summary (4/12) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-24">
            <h2 className="text-xl font-black mb-6 italic tracking-tighter uppercase">Order Summary</h2>
            
            {/* รายการสินค้าสั้นๆ */}
            <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.name} (x{item.quantity})</span>
                  <span className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <hr className="mb-6 border-dashed" />

            {/* ส่วนลด Coupon */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Promo Code" 
                  className="flex-grow p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-indigo-500 outline-none uppercase font-bold"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button 
                  onClick={handleVerifyCoupon}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition"
                >
                  Apply
                </button>
              </div>
              {couponMsg.text && (
                <p className={`text-[11px] mt-2 font-bold ${couponMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* สรุปยอดเงิน */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>฿{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>฿{shippingFee.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500 font-bold">
                  <span>Discount</span>
                  <span>-฿{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black pt-4 border-t border-gray-100">
                <span>TOTAL</span>
                <span className="text-indigo-600">฿{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button 
              disabled={loading}
              onClick={handleSubmitOrder}
              className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black italic tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/30 disabled:bg-gray-400"
            >
              {loading ? 'PROCESSING...' : 'PLACE ORDER NOW'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;