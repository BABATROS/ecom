import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, Loader2, Landmark, Copy, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer"); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { items = [], subtotal = 0, shipping = 0, discount = 0, total = 0 } = location.state || {};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmOrder = async () => {
    if (!address.trim()) {
      alert("กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน");
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userId = userData?.id || userData?._id;

    if (!token || !userId) {
      alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // 📦 เตรียม Payload ให้ตรงกับ Backend
      const orderPayload = {
        user: userId,
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.image
        })),
        total: Number(total),
        shippingAddress: address, // ✅ แก้ไขจาก address เป็น shippingAddress แล้ว
        paymentMethod: paymentMethod
      };

      // 🚀 ส่งข้อมูลไปยัง Render Backend
      const response = await axios.post('https://ecom-ghqt.onrender.com/api/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert(paymentMethod === "Transfer" 
          ? "✅ สร้างคำสั่งซื้อแล้ว! กรุณาแจ้งชำระเงินในหน้า 'ออเดอร์ของฉัน'" 
          : "🎉 สั่งซื้อสำเร็จ! รอรับสินค้าได้เลย");
        
        localStorage.removeItem('cart'); 
        navigate('/my-orders', { replace: true });
      }
    } catch (error) {
      console.error("Checkout Error:", error.response?.data);
      const msg = error.response?.data?.message || "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง";
      alert("ไม่สามารถสั่งซื้อได้: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <Package size={64} className="text-zinc-800 mb-4" />
        <p className="text-zinc-500 mb-4 font-bold tracking-widest uppercase">ไม่พบสินค้าในคำสั่งซื้อ</p>
        <button onClick={() => navigate('/cart')} className="bg-red-600 px-10 py-4 rounded-2xl font-black hover:bg-white hover:text-black transition-all">
          RETURN TO CART
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-black text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black italic mb-10 tracking-tighter uppercase text-red-600">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="bg-zinc-900 p-6 md:p-8 rounded-[2.5rem] border border-zinc-800 shadow-xl">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                <MapPin className="text-red-500" size={24} /> SHIPPING ADDRESS
              </h2>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ชื่อ-นามสกุล, เบอร์โทรศัพท์, ที่อยู่จัดส่งโดยละเอียด..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 outline-none focus:border-red-600 h-36 text-white resize-none transition-all"
              ></textarea>
            </div>

            <div className="bg-zinc-900 p-6 md:p-8 rounded-[2.5rem] border border-zinc-800 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <CreditCard className="text-red-500" size={24} /> PAYMENT METHOD
              </h2>
              
              <div className="space-y-4">
                <div 
                  onClick={() => setPaymentMethod("Transfer")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4
                    ${paymentMethod === 'Transfer' ? 'border-red-600 bg-red-600/5' : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Landmark size={24} className={paymentMethod === 'Transfer' ? 'text-red-500' : 'text-zinc-500'} />
                      <div>
                        <p className="font-bold">Bank Transfer</p>
                        <p className="text-xs text-zinc-500">โอนผ่านธนาคาร / Mobile Banking</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'Transfer' ? 'bg-red-600 border-zinc-900' : 'border-zinc-700'}`}></div>
                  </div>

                  {paymentMethod === 'Transfer' && (
                    <div className="bg-zinc-800/80 p-4 rounded-xl border border-zinc-700 mt-2 space-y-3 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-400 font-bold uppercase">K-Bank (กสิกรไทย)</span>
                        <CheckCircle2 size={14} className="text-green-500" />
                      </div>
                      <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard("123-4-56789-0")}>
                        <p className="text-xl font-mono font-black tracking-widest text-white">123-4-56789-0</p>
                        {copied ? <span className="text-[10px] text-green-500 font-bold">COPIED!</span> : <Copy size={16} className="text-zinc-500" />}
                      </div>
                      <p className="text-sm font-bold text-zinc-300">ชื่อบัญชี: บจก. สนิคเกอร์ ฮับ (SNKR HUB)</p>
                    </div>
                  )}
                </div>

                <div 
                  onClick={() => setPaymentMethod("Cash on Delivery")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center
                    ${paymentMethod === 'Cash on Delivery' ? 'border-red-600 bg-red-600/5' : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center gap-4">
                    <Package size={24} className={paymentMethod === 'Cash on Delivery' ? 'text-red-500' : 'text-zinc-500'} />
                    <div>
                      <p className="font-bold">Cash on Delivery</p>
                      <p className="text-xs text-zinc-500">ชำระเงินสดเมื่อได้รับสินค้า</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-4 ${paymentMethod === 'Cash on Delivery' ? 'bg-red-600 border-zinc-900' : 'border-zinc-700'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-[3rem] border border-zinc-800 h-fit lg:sticky lg:top-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Package size={20} /> Order Summary
            </h2>
            
            <div className="max-h-52 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-white line-clamp-1">{item.name}</p>
                    <p className="text-zinc-500 text-[10px] font-bold">QTY: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-white">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-800 mb-8">
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Subtotal</span>
                <span className="text-white">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Shipping</span>
                <span className="text-green-500 font-bold">{shipping === 0 ? 'FREE' : `฿${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-4xl font-black italic pt-6 mt-4 border-t border-zinc-800/50">
                <span className="tracking-tighter uppercase">Total</span>
                <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className={`w-full py-6 rounded-[2rem] font-black text-2xl transition-all flex items-center justify-center gap-3
                ${isSubmitting ? 'bg-zinc-800 text-zinc-500' : 'bg-red-600 text-white hover:bg-white hover:text-black active:scale-95'}`}
            >
              {isSubmitting ? <><Loader2 className="animate-spin" /> PROCESSING</> : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;