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
        // 🟢 1. แก้ไขการดึงข้อมูล ให้รองรับโครงสร้างที่ Backend ส่งมา
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

  const addToCart = () => {
    if (!selectedSize) return alert('กรุณาเลือกไซส์รองเท้าก่อนหยิบใส่ตะกร้า');
    
    // ดึงข้อมูลตะกร้าปัจจุบัน
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // ตรวจสอบว่ามีสินค้านี้ในตะกร้าหรือยัง (เช็คทั้ง ID และ Size)
    const existingItem = cart.find(item => item._id === product._id && item.size === selectedSize);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        size: selectedSize,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`เพิ่ม ${product.name} (Size ${selectedSize}) ลงตะกร้าแล้ว!`);
    // Optional: navigate('/cart');
  };

  // 🟢 2. ฟังก์ชันเช็ค URL รูปภาพ (ถ้าเป็น Cloudinary ให้ใช้ลิงก์ตรงเลย ไม่ต้องเติม /uploads/)
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/600x800?text=No+Image';
    return img.startsWith('http') ? img : `${BACKEND_URL}/uploads/${img}`;
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

  // 🟢 3. ดึงค่าจำนวนสต๊อก โดยเช็คจาก totalStock แทน (ตามชื่อฟิลด์ใน MongoDB)
  const currentStock = product.totalStock !== undefined ? product.totalStock : (product.stock || 0);
  const isAvailable = currentStock > 0;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-zinc-500 hover:text-red-600 mb-12 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
        >
          <ArrowLeft size={16} /> Return to Vault
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          
          {/* Left: Media Gallery */}
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-zinc-900/50 rounded-[3.5rem] overflow-hidden border border-zinc-800 group relative shadow-2xl">
              <img 
                src={product.images && product.images.length > 0 ? getImageUrl(product.images[selectedImage]) : 'https://placehold.co/600x800?text=No+Image'} 
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

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-red-600 scale-95 shadow-lg' : 'border-zinc-800 opacity-40 hover:opacity-100'}`}
                  >
                    <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`view-${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
               <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[11px] mb-3 italic">{product.brand || 'Original Series'}</p>
               <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-[0.85] text-stroke-small">
                 {product.name}
               </h1>
               <div className="flex items-center gap-6 mt-6">
                  <span className="text-5xl font-black text-white italic tracking-tighter">
                    {/* ป้องกัน ฿NaN โดยการแปลงเป็น 0 ถ้าหาไม่เจอ */}
                    ฿{Number(product.price || 0).toLocaleString()}
                  </span>
                  <div className="h-8 w-[2px] bg-zinc-800"></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${isAvailable ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500'}`}>
                    {isAvailable ? `Stock: ${currentStock} Units` : 'Sold Out'}
                  </span>
               </div>
            </div>

            {/* Size Selector */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest italic">Select Size (EU)</h3>
                <span className="text-zinc-700 font-bold text-[9px] uppercase underline cursor-pointer hover:text-white transition-colors">Size Guide</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-4 rounded-2xl font-black italic transition-all border-2 ${
                      selectedSize === size 
                      ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-zinc-900/30 backdrop-blur-md p-8 rounded-[2.5rem] border border-zinc-800/50 mb-10 group hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-4 opacity-50">
                <Info size={14} />
                <h3 className="text-zinc-400 font-black uppercase text-[9px] tracking-[0.3em]">Story & Details</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed italic text-sm font-medium whitespace-pre-line group-hover:text-zinc-300 transition-colors">
                {product.description || "Designed for those who demand excellence. This unit features premium materials and heritage-inspired aesthetics."}
              </p>
            </div>

            {/* Shipping & Authenticity */}
            <div className="flex flex-wrap gap-8 mb-12 border-y border-zinc-900 py-6">
              <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-red-600 shadow-xl">
                    <Truck size={18} />
                </div>
                Priority Shipping
              </div>
              <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-red-600 shadow-xl">
                    <ShieldCheck size={18} />
                </div>
                Verified Authentic
              </div>
            </div>

            {/* Action Button */}
            <button 
              disabled={!isAvailable}
              className={`group w-full py-7 rounded-[2.5rem] font-black text-2xl italic tracking-tighter flex items-center justify-center gap-4 transition-all transform active:scale-95 shadow-2xl ${
                isAvailable 
                ? 'bg-red-600 hover:bg-white hover:text-black shadow-[0_20px_40px_rgba(220,38,38,0.2)]' 
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              onClick={addToCart}
            >
              {isAvailable ? (
                <>
                  <ShoppingCart size={28} className="group-hover:-translate-y-1 transition-transform" /> 
                  ADD TO DROPS
                </>
              ) : (
                'DROP EXPIRED'
              )}
            </button>
            
            <p className="text-center mt-6 text-[9px] text-zinc-700 font-black uppercase tracking-[0.5em] italic">
              Secure Checkout // Powered by SNKR HUB
            </p>
          </div>
        </div>
      </div>

      {/* Tailwind Custom Class for text stroke */}
      <style jsx="true">{`
        .text-stroke-small {
          -webkit-text-stroke: 1px rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;