import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingBag, Zap, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('https://ecom-ghqt.onrender.com/api/products');
        
        // 🕵️‍♂️ แอบดูข้อมูลใน Console (กด F12 ดูได้) ว่าหลังบ้านส่งอะไรมา
        console.log("ข้อมูลจาก Backend:", res.data); 

        // 🟢 ปรับเงื่อนไขให้ฉลาดขึ้น รองรับหลายรูปแบบ
        if (Array.isArray(res.data)) {
            setProducts(res.data); // กรณีส่ง Array มาตรงๆ
        } else if (res.data && Array.isArray(res.data.products)) {
            setProducts(res.data.products); // กรณีส่งมาเป็น { products: [...] }
        } else if (res.data && Array.isArray(res.data.data)) {
            setProducts(res.data.data); // กรณีส่งมาเป็น { data: [...] }
        } else {
            // ถ้าไม่ตรงเงื่อนไขเลยค่อยให้ว่างเปล่า
            setProducts([]); 
        }
        
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ส่วนของ Skeleton Loading เพื่อความเนียนตา
  if (loading) return (
    <div className="min-h-screen bg-black p-8 max-w-7xl mx-auto">
      <div className="h-20 w-64 bg-zinc-900 rounded-3xl mb-12 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-[4/5] bg-zinc-900 rounded-[2.5rem] animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-red-600 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero / Header Section */}
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600/10 blur-[120px] rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
               <Zap size={14} fill="currentColor" /> Live Now
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] uppercase">
              NEW <br /> <span className="text-red-600">ARRIVALS</span>
            </h1>
            <p className="text-zinc-500 font-bold mt-6 uppercase tracking-[0.3em] text-[10px] max-w-sm leading-loose">
              High-performance kicks for the concrete jungle. Exclusive drops only at SNKR HUB.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end gap-4">
             <div className="text-right">
                <p className="text-zinc-500 font-black text-[10px] uppercase tracking-widest">Global Shipping</p>
                <p className="text-white font-bold text-sm italic italic">Express Delivery Available</p>
             </div>
             <button onClick={() => navigate('/coupons')} className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl flex items-center gap-3 group hover:border-red-600 transition-all shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-widest">Claim Coupons</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </header>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map(product => (
              <div 
                key={product._id} 
                onClick={() => navigate(`/product/${product._id}`)} 
                className="group cursor-pointer transform transition-all duration-500 hover:-translate-y-4"
              >
                <div className="relative">
                   {/* Badge สำหรับของใหม่ */}
                   <div className="absolute top-4 left-4 z-20 bg-white text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic">
                     Hot Drop
                   </div>
                   
                   {/* Product Card Component */}
                   <ProductCard product={product} />
                   
                   {/* Overlay Effect เมื่อ Hover */}
                   <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 rounded-[2.5rem] transition-colors duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State - ออกแบบให้ดูพรีเมียม */
          <div className="text-center py-40 bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-zinc-800/50 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <ShoppingBag size={400} />
             </div>
             <div className="relative z-10">
                <div className="bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-2xl">
                   <ShoppingBag className="text-zinc-700" size={32} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-500 mb-2">The Vault is Locked</h2>
                <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px]">
                   No sneakers in stock. New drop coming soon.
                </p>
             </div>
          </div>
        )}

        {/* Quick Footer / Stats */}
        <div className="mt-32 pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
           <p className="text-[10px] font-black uppercase tracking-[0.6em]">SNKR HUB // 2026 EDITION</p>
           <div className="flex gap-8 items-center">
              <span className="text-[9px] font-black uppercase tracking-widest italic">Authenticity Guaranteed</span>
              <span className="text-[9px] font-black uppercase tracking-widest italic">Secure Payment</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;