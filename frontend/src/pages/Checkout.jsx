import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Phone, User, Receipt, ShieldCheck, UploadCloud, FileImage, Loader2 } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [slipImage, setSlipImage] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // ป้องกันการกดเบิ้ลตอนกำลังโหลด

  // 1. ดึงข้อมูลตะกร้าจาก LocalStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
    window.scrollTo(0, 0);
  }, []);

  // 2. คำนวณราคา (ดักจับ Number ป้องกัน NaN)
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + (price * qty);
  }, 0);
  
  const shipping = 50; // ค่าจัดส่งคงที่
  const total = (subtotal + shipping) - discount;

  // 3. จัดการฟอร์มข้อมูลผู้รับ
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. จัดการไฟล์รูปสลิปตอนลูกค้ากดเลือกรูป
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipImage(file);
      setSlipPreview(URL.createObjectURL(file)); // สร้างตัวอย่างรูปให้ดูชั่วคราวบนหน้าเว็บ
    }
  };

  // 5. จำลองการกรอกคูปองส่วนลด
  const handleApplyPromo = () => {
    if (promoCode === 'DOREMON') {
      setDiscount(10);
      alert('ใช้งานคูปองสำเร็จ! ลด 10 บาท');
    } else {
      alert('คูปองไม่ถูกต้อง หรือหมดอายุแล้ว');
      setDiscount(0);
    }
  };

  // 6. 🚀 ฟังก์ชันสั่งซื้อของจริง (อัปโหลดสลิป + บันทึกออเดอร์)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('ตะกร้าสินค้าว่างเปล่า!');
    if (!formData.name || !formData.phone || !formData.address) return alert('กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน');
    if (!slipImage) return alert('กรุณาแนบรูปสลิปหลักฐานการโอนเงิน');

    setIsSubmitting(true);

    try {
      // 🚀 สเต็ป A: อัปโหลดรูปสลิปไปที่เซิร์ฟเวอร์ก่อน
      const uploadData = new FormData();
      uploadData.append('image', slipImage); // 'image' คือชื่อ key ที่ใช้ใน backend/routes/upload.js

      const uploadRes = await axios.post('https://ecom-ghqt.onrender.com/api/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      // ดึงลิงก์หรือชื่อไฟล์รูปสลิปที่เซิร์ฟเวอร์ตอบกลับมา
      const uploadedSlipUrl = uploadRes.data.imageUrl || uploadRes.data.image || uploadRes.data.url; 

      // 🚀 สเต็ป B: แพ็คข้อมูลออเดอร์ทั้งหมด + ลิงก์รูปสลิป
      const orderData = {
        shippingDetails: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address
        },
        items: cart.map(item => ({
            productId: item._id || item.productId,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price
        })),
        subtotal: subtotal,
        shippingFee: shipping,
        discount: discount,
        totalAmount: total,
        slipImage: uploadedSlipUrl, // 🟢 แนบรูปสลิปตัวจริงลงไปตรงนี้
        status: 'pending' // สถานะรอยืนยัน
      };

      // 🚀 สเต็ป C: ส่งข้อมูลออเดอร์ไปบันทึกในฐานข้อมูล
      await axios.post('https://ecom-ghqt.onrender.com/api/orders', orderData);

      alert('🎉 สั่งซื้อสำเร็จ! ระบบได้รับหลักฐานการโอนเงินของคุณแล้ว');
      localStorage.removeItem('cart'); // ล้างตะกร้าหลังสั่งเสร็จ
      navigate('/'); // พากลับหน้าแรก

    } catch (error) {
      console.error("Order error:", error);
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ หรือระบบอัปโหลดขัดข้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false); // ปลดล็อกปุ่ม
    }
  };

  // ถ้ายกเลิกสินค้าจนตะกร้าว่าง
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <Receipt size={64} className="text-zinc-700 mb-6" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Cart is Empty</h2>
        <button onClick={() => navigate('/')} className="bg-red-600 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Return to Vault
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-red-600">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-red-600 mb-8 transition-colors text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Return to Cart
        </button>
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-12 border-b border-zinc-900 pb-6">
          Secure <span className="text-red-600">Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Form & Payment */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 📦 1. Shipping Details */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
              <h2 className="text-xl font-black italic uppercase tracking-wider mb-6 flex items-center gap-3">
                <MapPin className="text-red-600" /> Shipping Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input type="text" name="name" placeholder="ชื่อ-นามสกุล (Full Name)" onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-600" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input type="text" name="phone" placeholder="เบอร์โทรศัพท์ (Phone)" onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-600" />
                  </div>
                </div>
                <textarea name="address" rows="3" placeholder="ที่อยู่จัดส่งโดยละเอียด (Full Address)" onChange={handleInputChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-600 resize-none"></textarea>
              </div>
            </div>

            {/* 💳 2. Payment Method & Upload Slip */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
              <h2 className="text-xl font-black italic uppercase tracking-wider mb-6 flex items-center gap-3">
                <Receipt className="text-red-600" /> Payment Transfer
              </h2>
              
              {/* Fake Bank Account Info */}
              <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-6 text-center">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">ธนาคารกสิกรไทย (KBank)</p>
                <p className="text-3xl font-black tracking-widest text-white mb-1">123-4-56789-0</p>
                <p className="text-zinc-500 text-xs font-bold uppercase">SNKR HUB CO., LTD.</p>
              </div>

              {/* Upload Area */}
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="slip-upload" />
                <label htmlFor="slip-upload" 
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${slipImage ? 'border-green-500 bg-green-500/5' : 'border-zinc-700 bg-zinc-950 hover:border-red-600 hover:bg-zinc-900'}`}>
                  
                  {slipPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileImage className="text-green-500" size={32} />
                      <span className="text-green-500 font-bold text-sm">แนบสลิปเรียบร้อยแล้ว</span>
                      <span className="text-zinc-500 text-[10px] underline">คลิกเพื่อเปลี่ยนรูป</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <UploadCloud size={32} />
                      <span className="font-bold text-sm">คลิกเพื่ออัปโหลดสลิปโอนเงิน</span>
                      <span className="text-[10px] uppercase tracking-widest">Supports JPG, PNG</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 sticky top-8">
              <h2 className="text-xl font-black italic uppercase tracking-wider mb-6 border-b border-zinc-800 pb-4">Order Summary</h2>
              
              {/* Mini Cart List */}
              <div className="space-y-4 mb-8 max-h-48 overflow-y-auto scrollbar-hide pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/50 p-3 rounded-xl border border-zinc-800/50">
                    <div>
                      <p className="font-bold text-sm truncate w-40">{item.name}</p>
                      <p className="text-zinc-500 text-[10px] uppercase">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">฿{(Number(item.price) * Number(item.quantity)).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="flex gap-2 mb-8 border-b border-zinc-800 pb-8">
                <input type="text" placeholder="PROMO CODE" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-white text-sm font-bold placeholder:text-zinc-600 focus:outline-none focus:border-red-600 uppercase" />
                <button type="button" onClick={handleApplyPromo} className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-red-600 transition-colors">
                  Apply
                </button>
              </div>

              {/* Calculation */}
              <div className="space-y-3 mb-8 text-sm font-bold text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">฿{shipping.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>- ฿{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800 mt-4">
                  <span className="text-white text-lg font-black uppercase">Total</span>
                  <span className="text-red-600 text-3xl font-black italic tracking-tighter">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handlePlaceOrder} 
                disabled={isSubmitting}
                className={`w-full py-5 rounded-full font-black text-xl italic uppercase tracking-tighter flex justify-center items-center gap-3 transition-all shadow-xl ${
                  isSubmitting 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-red-600 hover:text-white'
                }`}
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={24} /> Processing...</>
                ) : (
                  <><ShieldCheck size={24} /> Place Order Now</>
                )}
              </button>
              <p className="text-center text-zinc-600 text-[9px] uppercase tracking-[0.2em] mt-4 font-bold">
                By placing this order, you agree to our terms.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;