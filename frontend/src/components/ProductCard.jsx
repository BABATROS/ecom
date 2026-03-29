import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { addToCart } from '../utils/cartUtils';

const ProductCard = ({ product }) => {
  // ✅ ป้องกันจอขาว: เช็คว่ามีรูปไหม ถ้าไม่มีให้ใช้รูป Placeholder
  const imageUrl = product?.images?.length > 0 
    ? `https://ecom-ghqt.onrender.com/uploads/${product.images[0]}`
    : 'https://via.placeholder.com/400?text=No+Image';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-red-600 transition-all duration-300">
      <div className="aspect-square overflow-hidden bg-zinc-800">
        <img 
          src={imageUrl} 
          alt={product?.name || "Sneaker"}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Error+Loading'; }}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white truncate">{product?.name || "Unknown Sneaker"}</h3>
        <p className="text-red-500 font-mono mt-1">฿{product?.price?.toLocaleString() || "0"}</p>
        
        <button
          type="button"
          onClick={() => {
            addToCart(product);
            alert(`${product.name} ถูกเพิ่มลงตระกร้าแล้ว`);
          }}
          className="w-full mt-4 bg-white text-black py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-red-600 hover:text-white transition-colors"
        >
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;