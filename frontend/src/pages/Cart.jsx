import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Tag, Truck, ArrowLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getCart, removeFromCart } from '../utils/cartUtils';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://ecom-ghqt.onrender.com';

  // 🔄 โหลดข้อมูลตะกร้าเริ่มต้น
  useEffect(() => {
    const loadCart = () => {
      const items = getCart();
      setCartItems(Array.isArray(items) ? items : []);
    };
    loadCart();
  }, []);

  // 1. คำนวณราคารวมสินค้า (Subtotal)
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
  }, [cartItems]);

  const baseShipping = cartItems.length > 0 ? 50 : 0;
  
  // 2. คำนวณส่วนลด (Discount)
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'amount') return appliedCoupon.discountValue;
    if (appliedCoupon.discountType === 'percent') {
      return Math.floor(subtotal * (appliedCoupon.discountValue / 100));
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  // 3. คำนวณค่าส่ง (Shipping)
  const shipping = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return appliedCoupon?.discountType === 'free_shipping' ? 0 : baseShipping;
  }, [appliedCoupon, cartItems.length, baseShipping]);

  // 4. ยอดรวมสุทธิ
  const total = Math.max(subtotal + shipping - discount, 0);

  // --- ฟังก์ชันใช้คูปอง ---
  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return setCouponMessage('โปรดระบุโค้ดส่วนลด');

    setIsLoading(true);
    setCouponMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCouponMessage('กรุณา Login ก่อนใช้คูปอง');
        return;
      }

      // 📍 ยิง API ไปที่ verify route
      const res = await axios.post(
        `${API_BASE_URL}/api/coupons/verify`, 
        { code, cartTotal: subtotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.coupon) {
        setAppliedCoupon(res.data.coupon);
        setCouponMessage(''); // ล้าง Error Message เมื่อสำเร็จ
      }
    } catch (err) {
      // ดึง Error จาก Backend มาแสดง
      const errorMsg = err.response?.data?.msg || 'โค้ดไม่ถูกต้องหรือหมดอายุ';
      setCouponMessage(errorMsg);
      setAppliedCoupon(null);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage('');
  };

  const handleRemoveItem = (id) => {
    const updatedCart = removeFromCart(id);
    setCartItems(updatedCart);
    // หากลบจนยอดรวมไม่ถึงขั้นต่ำของคูปอง ให้ยกเลิกคูปองอัตโนมัติ
    if (appliedCoupon && subtotal < (appliedCoupon.minOrder || 0)) {
      removeCoupon();
    }
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ");
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) return alert("ตะกร้าของคุณยังว่างอยู่");
    
    // ส่งข้อมูลครบถ้วนไปยังหน้า Checkout
    navigate('/checkout', {
      state: { items: cartItems, subtotal, shipping, discount, total, appliedCoupon }
    });
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-black text-white font-sans selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-zinc-500 hover:text-white transition-colors font-black text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} className="mr-2" /> CONTINUE SHOPPING
          </button>
          <div className="text-right">
            <h1 className="text-5xl font-black italic text-red-600 tracking-tighter uppercase leading-none">YOUR CART</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 tracking-[0.2em]">{cartItems.length} ITEMS SELECTED</p>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* List of Items */}
            <div className="lg:col-span-8 space-y-6">
              {cartItems.map((item) => (
                <div key={item._id} className="group relative bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800 flex flex-col sm:flex-row items-center gap-8 hover:bg-zinc-900 transition-all hover:border-zinc-600 shadow-2xl">
                  <div className="w-32 h-32 bg-zinc-800 rounded-[2rem] overflow-hidden flex-shrink-0 border border-zinc-700">
                    <img
                      src={item.images?.[0] ? `${API_BASE_URL}/uploads/${item.images[0]}` : 'https://placehold.co/400x400/18181b/dc2626?text=Sneaker'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x400/18181b/dc2626?text=Sneaker' }}
                    />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{item.brand || 'Sneaker Hub'}</p>
                    <h2 className="text-2xl font-black uppercase tracking-tight italic mb-2 group-hover:text-red-600 transition-colors">{item.name}</h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 items-center">
                      <span className="text-xs bg-zinc-800 px-4 py-1.5 rounded-full font-bold text-zinc-400">Qty: {item.quantity}</span>
                      <p className="text-xl font-black text-white italic tracking-tighter">
                        ฿{(Number(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="p-4 bg-zinc-800/50 rounded-2xl text-zinc-600 hover:bg-red-600 hover:text-white transition-all active:scale-90"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 h-fit sticky top-24 shadow-2xl overflow-hidden">
                <h3 className="text-xl font-black mb-8 italic uppercase tracking-widest text-red-600 border-b border-zinc-800 pb-4">CHECK OUT</h3>
                
                {/* Coupon UI */}
                <div className="space-y-4 mb-10">
                  <div className="relative">
                    <input
                      type="text"
                      disabled={appliedCoupon || isLoading}
                      value={couponCode}
                      placeholder="DISCOUNT CODE"
                      className={`w-full bg-black p-5 rounded-2xl outline-none border-2 transition-all font-black uppercase tracking-widest text-sm ${appliedCoupon ? 'border-green-500 text-green-500' : 'border-zinc-800 focus:border-red-600'}`}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    {appliedCoupon && (
                      <button onClick={removeCoupon} className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 p-1 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {!appliedCoupon ? (
                    <button
                      onClick={applyCoupon}
                      disabled={isLoading || !couponCode}
                      className="w-full bg-zinc-800 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'APPLY CODE'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest px-2 animate-pulse">
                      <Tag size={12} /> {appliedCoupon.code} ACTIVE (-฿{discount.toLocaleString()})
                    </div>
                  )}

                  {couponMessage && !appliedCoupon && (
                    <p className="text-xs font-bold text-red-500 ml-2 italic animate-bounce">
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Price Calculation Details */}
                <div className="space-y-5 text-zinc-400 mb-10 font-bold text-sm tracking-tight">
                  <div className="flex justify-between items-center">
                    <span className="uppercase text-[10px] tracking-widest">Order Value</span>
                    <span className="text-white font-mono text-lg">฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 uppercase text-[10px] tracking-widest">
                      <Truck size={14} className="text-red-600" /> Delivery
                    </div>
                    <span className={`font-mono text-lg ${shipping === 0 ? 'text-green-500' : 'text-white'}`}>
                      {shipping === 0 ? 'FREE' : `฿${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-400">
                      <span className="uppercase text-[10px] tracking-widest">Discount</span>
                      <span className="font-mono text-lg">-฿{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-zinc-800 flex justify-between items-end">
                    <span className="text-3xl font-black italic tracking-tighter uppercase text-white">TOTAL</span>
                    <span className="text-4xl font-black text-red-600 font-mono tracking-tighter">฿{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout} 
                  className="w-full bg-red-600 py-6 rounded-3xl font-black text-lg hover:bg-white hover:text-black transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-95"
                >
                  SECURE CHECKOUT <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-40 bg-zinc-900/20 rounded-[4rem] border-4 border-dashed border-zinc-800/50 backdrop-blur-sm">
            <ShoppingBag size={80} className="mx-auto text-zinc-800 mb-8 opacity-20" />
            <h2 className="text-3xl font-black italic mb-4 uppercase tracking-tighter text-zinc-500">YOUR VAULT IS EMPTY</h2>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-black px-12 py-5 rounded-3xl font-black text-sm hover:bg-red-600 hover:text-white transition-all shadow-2xl tracking-widest"
            >
              SHOP LATEST DROP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;