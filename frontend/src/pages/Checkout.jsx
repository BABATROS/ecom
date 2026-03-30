import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, Loader2, Landmark, Copy, CheckCircle2, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { clearCart } from '../utils/cartUtils'; // นำเข้าฟังก์ชันล้างตะกร้า

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer"); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // ดึงข้อมูลจาก State ที่ส่งมาจากหน้า Cart
  const { items = [], subtotal = 0, shipping = 0, discount = 0, total = 0, appliedCoupon = null } = location.state || {};

  const API_BASE_URL = 'https://ecom-ghqt.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
      navigate('/login');
    }
  }, [navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmOrder = async () => {
    if (!address.trim() || address.length < 10) {
      alert("กรุณากรอกที่อยู่จัดส่งให้ชัดเจน (ชื่อ-เบอร์โทร-ที่อยู่)");
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userId = userData?.id || userData?._id;

    setIsSubmitting(true);

    try {
      const orderPayload = {
        user: userId,
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.image
        })),
        subtotal: Number(subtotal),
        discount: Number(discount),
        shippingCost: Number(shipping),
        total: Number(total),
        shippingAddress: address,
        paymentMethod: paymentMethod,
        couponUsed: appliedCoupon?.code || null
      };

      const response = await axios.post(`${API_BASE_URL}/api/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // ✅ ล้างตะกร้าทันทีหลังสั่งซื้อสำเร็จ
        clearCart(); 
        
        alert(paymentMethod === "Transfer" 
          ? "🔥 รับออเดอร์แล้ว! อย่าลืมแจ้งชำระเงินที่เมนู 'My Orders'" 
          : "🎉 สั่งซื้อสำเร็จ! เราจะรีบจัดส่งให้เร็วที่สุด");
        
        navigate('/my-orders', { replace: true });
      }
    } catch (error) {
      console.error("Checkout Error:", error.response?.data);
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // กรณีไม่มีสินค้าในหน้า Checkout (เช่น กด Refresh หน้า หรือย้อนกลับ)
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <div className="bg-zinc-900 p-12 rounded-[3rem] border border-zinc-800 text-center shadow-2xl">
          <Package size={80} className="text-zinc-800 mx-auto mb-6 opacity-20" />
          <h2 className="text-2xl font-black italic mb-4 uppercase tracking-tighter">No Active Order</h2>
          <button onClick={() => navigate('/cart')} className="bg-red-600 px-12 py-4 rounded-2xl font-black hover:bg-white hover:text-black transition-all transform hover:scale-105">
            BACK TO CART
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-12 bg-black text-white font-sans selection:bg-red-600">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => navigate('/cart')} className="flex items-center text-zinc-500 hover:text-white transition-colors font-black text-[10px] uppercase tracking-[0.3em] mb-8">
          <ChevronLeft size={16} /> Back to selection
        </button>

        <h1 className="text-5xl md:text-6xl font-black italic mb-12 tracking-tighter uppercase text-red-600 leading-none">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Form Info */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Address Section */}
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[3rem] border border-zinc-800 shadow-2xl">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3 italic tracking-tight">
                <MapPin className="text-red-600" size={24} /> SHIPPING INFO
              </h2>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ชื่อ-นามสกุล, เบอร์โทรศัพท์ และที่อยู่จัดส่งโดยละเอียด..."
                className="w-full bg-black border border-zinc-800 rounded-[2rem] p-6 outline-none focus:border-red-600 h-44 text-white resize-none transition-all font-medium placeholder:text-zinc-700 shadow-inner"
              ></textarea>
            </div>

            {/* Payment Section */}
            <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[3rem] border border-zinc-800 shadow-2xl">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 italic tracking-tight">
                <CreditCard className="text-red-600" size={24} /> SELECT PAYMENT
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Bank Transfer Option */}
                <div 
                  onClick={() => setPaymentMethod("Transfer")}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col gap-6
                    ${paymentMethod === 'Transfer' ? 'border-red-600 bg-red-600/5 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-zinc-800 bg-zinc-800/20 hover:border-zinc-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <Landmark size={28} className={paymentMethod === 'Transfer' ? 'text-red-500' : 'text-zinc-600'} />
                      <div>
                        <p className="font-black text-lg italic tracking-tight uppercase leading-none">Bank Transfer</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">Mobile Banking / QR Code</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-4 transition-all ${paymentMethod === 'Transfer' ? 'bg-red-600 border-black ring-2 ring-red-600' : 'border-zinc-800'}`}></div>
                  </div>

                  {paymentMethod === 'Transfer' && (
                    <div className="bg-black/60 p-6 rounded-2xl border border-zinc-800 space-y-4 animate-in slide-in-from-top-2 duration-300 shadow-2xl">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">K-Bank Thailand</span>
                        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                          <CheckCircle2 size={12} /> Verified
                        </div>
                      </div>
                      <div className="flex justify-between items-center group cursor-pointer active:scale-95 transition-transform" onClick={() => copyToClipboard("123-4-56789-0")}>
                        <p className="text-2xl font-mono font-black tracking-[0.15em] text-white">123-4-56789-0</p>
                        <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                          {copied ? <span className="text-[9px] font-black px-1 uppercase tracking-widest">Done!</span> : <Copy size={18} />}
                        </div>
                      </div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest italic pt-2 border-t border-zinc-800">AC Name: SNKR HUB CO., LTD.</p>
                    </div>
                  )}
                </div>

                {/* COD Option */}
                <div 
                  onClick={() => setPaymentMethod("Cash on Delivery")}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex justify-between items-center
                    ${paymentMethod === 'Cash on Delivery' ? 'border-red-600 bg-red-600/5 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-zinc-800 bg-zinc-800/20 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center gap-5">
                    <Package size={28} className={paymentMethod === 'Cash on Delivery' ? 'text-red-500' : 'text-zinc-600'} />
                    <div>
                      <p className="font-black text-lg italic tracking-tight uppercase leading-none">Cash On Delivery</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">Pay when item arrives</p>
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-4 transition-all ${paymentMethod === 'Cash on Delivery' ? 'bg-red-600 border-black ring-2 ring-red-600' : 'border-zinc-800'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 h-fit lg:sticky lg:top-12">
            <div className="bg-zinc-900 p-10 rounded-[3.5rem] border border-zinc-800 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <h2 className="text-sm font-black mb-10 uppercase tracking-[0.3em] text-zinc-500 border-b border-zinc-800 pb-4">Secure Order Review</h2>
              
              <div className="max-h-60 overflow-y-auto space-y-6 mb-10 pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800 shadow-xl">
                      <img 
                        src={`${API_BASE_URL}/uploads/${item.image || item.images?.[0]}`} 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        alt={item.name} 
                        onError={(e) => e.target.src = 'https://placehold.co/100x100/18181b/dc2626?text=Sneaker'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white uppercase italic tracking-tighter truncate text-sm">{item.name}</p>
                      <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Size: US 10 / Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono text-white text-sm font-black italic tracking-tighter">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-zinc-800 mb-10 text-sm font-bold uppercase tracking-widest">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-green-500">{shipping === 0 ? 'FREE' : `฿${shipping.toLocaleString()}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span className="font-mono">-฿{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-4xl font-black italic pt-8 mt-4 border-t-2 border-zinc-800">
                  <span className="tracking-tighter uppercase text-white">Total</span>
                  <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] font-mono">฿{total.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className={`group w-full py-7 rounded-[2.5rem] font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl transform active:scale-95
                  ${isSubmitting ? 'bg-zinc-800 text-zinc-600' : 'bg-red-600 text-white hover:bg-white hover:text-black hover:-translate-y-2 shadow-red-600/20'}`}
              >
                {isSubmitting ? <><Loader2 className="animate-spin" /> VERIFYING...</> : 'CONFIRM ORDER'}
              </button>
              
              <p className="text-[9px] text-zinc-600 text-center mt-6 uppercase font-black tracking-[0.3em]">By clicking you agree to our terms of drop.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;