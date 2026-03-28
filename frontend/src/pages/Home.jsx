import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tighter italic">LIMITED DROPS</h1>
        <p className="text-gray-500">Exclusive sneakers for the culture.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <div key={product._id} className="bg-[#1a1a1a] rounded-3xl p-5 border border-transparent hover:border-green-500 transition-all group">
            <div className="relative h-60 mb-4 bg-[#252525] rounded-2xl overflow-hidden">
              {/* แสดงผลวิดีโอหรือภาพจาก Backend โดยตรง */}
              {product.video ? (
                <video src={`http://localhost:5000/${product.video}`} muted loop className="w-full h-full object-cover group-hover:scale-110 transition" onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
              ) : (
                <img src={`http://localhost:5000/${product.images[0]}`} alt={product.name} className="w-full h-full object-contain" />
              )}
            </div>
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-gray-400 mb-4">฿{product.price.toLocaleString()}</p>
            <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-green-500 transition">ADD TO CART</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Home;