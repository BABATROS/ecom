import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // แก้ไขเป็น URL ของ Render เรียบร้อยแล้ว
        const res = await axios.get('https://ecom-ghqt.onrender.com/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center text-zinc-500 italic font-black text-2xl animate-pulse">
      LOADING SNEAKERS...
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white">NEW ARRIVALS</h1>
          <p className="text-zinc-500 font-medium mt-2 uppercase tracking-widest text-xs">Explore the latest drops from Sneaker Hub.</p>
        </div>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center p-32 border-2 border-dashed border-zinc-800 rounded-[4rem] bg-zinc-900/20">
          <p className="text-zinc-600 italic text-xl font-bold uppercase">No sneakers in stock.</p>
          <p className="text-zinc-700 text-sm mt-2">Check back later or visit Admin to add products.</p>
        </div>
      )}
    </div>
  );
};

export default Home;