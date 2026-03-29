import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ShoppingCart, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // กำหนด Base URL ของ Backend
  const BACKEND_URL = 'https://ecom-ghqt.onrender.com';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <p className="text-2xl font-black italic mb-4">PRODUCT NOT FOUND</p>
      <button onClick={() => navigate('/')} className="bg-red-600 px-6 py-2 rounded-xl">BACK TO HOME</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-all font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} /> Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* ส่วนรูปภาพ: ปรับให้ดึงจาก /uploads/ */}
          <div className="space-y-4">
            <div className="aspect-square bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 group relative">
              <img 
                src={product.images?.[0] ? `${BACKEND_URL}/uploads/${product.images[0]}` : 'https://via.placeholder.com/600'} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-2 leading-none">
              {product.name}
            </h1>
            <p className="text-zinc-500 font-bold mb-8 uppercase tracking-widest">{product.brand || 'Sneakers'}</p>
            
            <div className="flex items-baseline gap-4 mb-8">
              {/* ปรับให้แสดงราคาที่ดึงมาจริง */}
              <span className="text-4xl font-black text-red-600 italic">
                ฿{product.price ? Number(product.price).toLocaleString() : '0'}
              </span>
            </div>

            <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800 mb-8">
              <h3 className="text-zinc-400 font-black uppercase text-xs tracking-widest mb-4">Description</h3>
              <p className="text-zinc-300 leading-relaxed italic whitespace-pre-line">
                {product.description || "The ultimate fusion of style and performance."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 text-zinc-400 text-sm font-bold">
                <Truck className="text-red-600" size={20} /> FREE SHIPPING
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm font-bold">
                <ShieldCheck className="text-red-600" size={20} /> 100% AUTHENTIC
              </div>
            </div>

            <button 
              className="w-full py-6 bg-red-600 rounded-[2rem] font-black text-2xl italic tracking-tighter flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
              onClick={() => alert(`Added ${product.name} to cart!`)}
            >
              <ShoppingCart size={28} /> ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;