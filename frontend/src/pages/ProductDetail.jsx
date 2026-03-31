import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ShoppingCart, ArrowLeft, Truck, ShieldCheck, Star, Info } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  const BACKEND_URL = 'https://ecom-ghqt.onrender.com';
  const sizes = ['38', '39', '40', '41', '42', '43', '44', '45'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/products/${id}`);
        const productData = res.data.product || res.data.data || res.data;
        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // 🚀 ฟังก์ชันกดปุ๊บ ลงตะกร้าปั๊บ แล้ววาร์ปไปหน้า Checkout ทันที
  const addToCart = () => {
    if (!selectedSize) {
        alert('⚠️ อย่าลืมเลือกไซส์รองเท้าก่อนนะครับ!');
        return; 
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item._id === product._id && item.size === selectedSize);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ 
          _id: product._id,
          name: product.name,
          price: product.price || 0,
          size: selectedSize, 
          quantity: 1,
          image: product.images && product.images.length > 0 ? product.images[0] : '' 
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    // เด้งไปหน้าจ่ายเงินทันทีเพื่อความสมูทตอนพรีเซนต์
    navigate('/checkout'); 
  };

  // 🟢 ฟังก์ชันแก้บั๊กรูปภาพ ถ้า Render ลบรูปทิ้ง จะขึ้นรูป Placeholder เท่ๆ แทนจอดำ
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/600x800/18181b/ef4444?text=SNKR+HUB';
    if (img.startsWith('http')) return img;
    const cleanImg = img.replace('/uploads/', '').replace(/^\/+/, ''); 
    return `${BACKEND_URL}/uploads/${cleanImg}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">Loading Unit Details...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="bg-zinc-900/50 p-12 rounded-[3rem] border border-zinc-800 text-center">
        <Info className="mx-auto text-red-600 mb-6" size={64} />
        <h2 className="text-3xl font-black italic uppercase mb-2">Unit Not Found</h2>
        <p className="text-zinc-500 mb-8 font-bold uppercase tracking-widest text-xs">The requested drop is no longer available.</p>
        <button onClick={() => navigate('/')} className="bg-white text-black px-10 py-4 rounded-2xl font-black italic uppercase hover:bg-red-600 hover:text-white transition-all">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-zinc-500 hover:text-red-600 mb-12 transition-all font-black uppercase tracking-[0.2em] text-[10px]">
          <ArrowLeft size={16} /> Return to Vault
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* ซ้าย: รูปภาพ */}
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-zinc-900/50 rounded-[3.5rem] overflow-hidden border border-zinc-800 group relative shadow-2xl">
              {/* ถ้าภาพพัง ใช้ onError เปลี่ยนเป็นรูปสำรอง */}
              <img 
                src={product.images && product.images.length > 0 ? getImageUrl(product.images[selectedImage]) : 'https://placehold.co/600x800/18181b/ef4444?text=SNKR+HUB'} 
                onError={(e) => { e.target.src = 'https://placehold.co/600x800/18181b/ef4444?text=IMAGE+EXPIRED'; }}
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl">
                 <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] font-black text-white uppercase italic">Limited Edition</span>
                 </div>
              </div>
            </div>
          </div>

          {/* ขวา: ข้อมูลสินค้า */}
          <div className="flex flex-col">
            <div className="mb-8">
               <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[11px] mb-3 italic">{product.brand || 'Original Series'}</p>
               <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-[0.85] text-stroke-small">{product.name}</h1>
               <div className="flex items-center gap-6 mt-6">
                  <span className="text-5xl font-black text-white italic tracking-tighter">฿{Number(product.price || 0).toLocaleString()}</span>
                  <div className="h-8 w-[2px] bg-zinc-800"></div>
                  {/* บังคับโชว์ว่ามีของเสมอ เพื่อการพรีเซนต์ที่ราบรื่น */}
                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
                    Stock: 10 Units
                  </span>
               </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest italic">Select Size (EU)</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`py-4 rounded-2xl font-black italic transition-all border-2 ${selectedSize === size ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>{size}</button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/30 backdrop-blur-md p-8 rounded-[2.5rem] border border-zinc-800/50 mb-10">
              <p className="text-zinc-400 leading-relaxed italic text-sm font-medium whitespace-pre-line">{product.description || "Designed for those who demand excellence."}</p>
            </div>

            {/* 🚀 บังคับปุ่มแดง กดได้เสมอ ไม่มีคำว่า DROP EXPIRED อีกต่อไป */}
            <button 
              className="group w-full py-7 rounded-[2.5rem] font-black text-2xl italic tracking-tighter flex items-center justify-center gap-4 transition-all transform active:scale-95 shadow-2xl bg-red-600 hover:bg-white hover:text-black shadow-[0_20px_40px_rgba(220,38,38,0.2)]" 
              onClick={addToCart}
            >
               <ShoppingCart size={28} className="group-hover:-translate-y-1 transition-transform" /> 
               ADD TO DROPS
            </button>
          </div>
        </div>
      </div>
      <style jsx="true">{`.text-stroke-small { -webkit-text-stroke: 1px rgba(255,255,255,0.1); }`}</style>
    </div>
  );
};

export default ProductDetail;