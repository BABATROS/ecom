// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import axios from 'axios';
import { getCart, removeFromCart, clearCart } from '../utils/cartUtils';

const Cart = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const navigate = useNavigate();

  // URL หลักของ Backend
  const API_BASE_URL = 'https://ecom-ghqt.onrender.com';

  useEffect(() => {
    const items = getCart();
    setCartItems(Array.isArray(items) ? items : []);

    const fetchCoupons = async () => {
      try {
        // ✅ แก้ไข Path เป็น /api/coupons ตามโครงสร้าง Backend ปกติ
        const res = await axios.get(`${API_BASE_URL}/api/coupons/available`);
        setAvailableCoupons(res.data);
      } catch (err) {
        console.error('Coupon fetch error:', err);
      }
    };
    fetchCoupons();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
  const baseShipping = cartItems.length > 0 ? 50 : 0;
  const shipping = appliedCoupon?.discountType === 'free_shipping' && cartItems.length > 0 ? 0 : baseShipping;
  
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'amount'
      ? appliedCoupon.discountValue
      : appliedCoupon.discountType === 'percent'
        ? Math.floor(subtotal * (appliedCoupon.discountValue / 100))
        : 0
    : 0;

  const total = Math.max(subtotal + shipping - discount, 0);

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนดำเนินการชำระเงิน");
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      alert("กรุณาเลือกสินค้าลงตะกร้าก่อนครับ");
      return;
    }
    navigate('/checkout', {
      state: { items: cartItems, subtotal, shipping, discount, total, appliedCoupon }
    });
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black italic mb-10 flex items-center tracking-tighter uppercase text-red-600">
          <ShoppingBag className="mr-4" size={36} />
          Your Cart
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 flex flex-col lg:flex-row gap-5 items-center hover:border-zinc-700 transition-all shadow-xl">
                  {/* ✅ แก้ไข Path รูปภาพเป็น /uploads/ */}
                  <img
                    src={item.image 
                      ? `${API_BASE_URL}/uploads/${item.image}` 
                      : (item.images && item.images.length > 0 
                          ? `${API_BASE_URL}/uploads/${item.images[0]}` 
                          : 'https://placehold.co/300x300/18181b/ef4444?text=Sneaker')}
                    alt={item.name}
                    className="w-28 h-28 rounded-2xl object-cover shadow-2xl border border-zinc-800"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x300/18181b/ef4444?text=Sneaker' }}
                  />
                  
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-xl font-bold uppercase tracking-tight">{item.name}</h2>
                    <p className="text-zinc-500 mt-1 font-medium italic text-sm">Quantity: {item.quantity}</p>
                    <p className="text-red-500 font-mono font-black mt-2 text-lg uppercase">
                      ฿{(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = removeFromCart(item._id);
                      setCartItems(updated);
                    }}
                    className="p-4 bg-zinc-800 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 h-fit sticky top-24 shadow-2xl">
              <h3 className="text-xl font-black mb-6 italic uppercase tracking-widest text-zinc-400">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    placeholder="Coupon Code"
                    className="flex-1 bg-zinc-800 p-4 rounded-2xl outline-none border border-zinc-700 focus:border-red-600 transition uppercase font-bold text-white"
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = couponCode.trim().toUpperCase();
                      const coupon = availableCoupons.find((c) => c.code === code);
                      if (!code) return setCouponMessage('กรุณาใส่โค้ด');
                      if (!coupon) return setCouponMessage('ไม่พบโค้ดนี้');
                      if (subtotal < coupon.minCartTotal) return setCouponMessage(`ขั้นต่ำ ฿${coupon.minCartTotal}`);
                      setAppliedCoupon(coupon);
                      setCouponMessage(`ใช้โค้ด ${coupon.code} สำเร็จ!`);
                    }}
                    className="bg-white text-black px-6 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all"
                  >
                    APPLY
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-sm font-bold ml-2 ${couponMessage.includes('สำเร็จ') ? 'text-green-400' : 'text-red-500'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="space-y-4 text-zinc-400 pb-6 border-b border-zinc-800 mb-6 font-medium text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-mono font-bold">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white font-mono font-bold">{shipping === 0 ? 'FREE' : `฿${shipping.toLocaleString()}`}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-฿{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-3xl font-black mb-8 italic">
                <span className="tracking-tighter uppercase">Total</span>
                <span className="text-red-600 font-mono">฿{total.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCheckout} 
                  className="w-full bg-red-600 py-5 rounded-2xl font-black text-xl hover:bg-white hover:text-black transition-all shadow-xl shadow-red-600/20 transform hover:-translate-y-1"
                >
                  CHECKOUT NOW
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if(window.confirm("ล้างรถเข็น?")) {
                      clearCart();
                      setCartItems([]);
                      setAppliedCoupon(null);
                      setCouponCode('');
                      setCouponMessage('');
                    }
                  }}
                  className="w-full bg-transparent border border-zinc-800 text-zinc-500 py-3 rounded-2xl font-bold text-sm hover:bg-zinc-800 hover:text-zinc-300 transition-all"
                >
                  CLEAR CART
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/50 rounded-[3.5rem] border border-dashed border-zinc-800">
            <p className="text-zinc-500 text-xl italic mb-6 uppercase tracking-widest font-black">Your cart is empty.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-black px-10 py-4 rounded-full font-black hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
            >
              START SHOPPING
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;