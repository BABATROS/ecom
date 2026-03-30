import React from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import { addToCart } from '../utils/cartUtils';

const ProductCard = ({ product }) => {
  // ✅ ปรับ Logic การดึงรูปภาพให้ยืดหยุ่นขึ้น
  const getImageUrl = () => {
    if (!product?.images || product.images.length === 0) {
      return 'https://via.placeholder.com/600x600?text=SNEAKER+HUB';
    }
    
    const firstImage = product.images[0];
    // ถ้าเป็น URL เต็มอยู่แล้ว (http...) ให้ใช้ได้เลย ถ้าไม่... ให้ต่อ Path Backend
    return firstImage.startsWith('http') 
      ? firstImage 
      : `https://ecom-ghqt.onrender.com/uploads/${firstImage}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault(); // กันการเผลอไปกดโดน Link ของ Card (ถ้ามี)
    addToCart(product);
    // คุณอาจเปลี่ยน alert เป็น Toast แจ้งเตือนสวยๆ ในอนาคต
    alert(`🔥 ${product.name} Added to cart!`);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-red-600/50 hover:bg-zinc-900 transition-all duration-500 shadow-xl">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-zinc-800/50">
        <img 
          src={getImageUrl()} 
          alt={product?.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=IMAGE+ERROR'; }}
        />
        
        {/* Brand Badge */}
        {product?.brand && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
            <Tag size={10} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white italic">
              {product.brand}
            </span>
          </div>
        )}

        {/* Overlay ไล่เฉดสีให้ข้อความอ่านง่าย */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-black text-white truncate uppercase italic tracking-tighter leading-tight group-hover:text-red-500 transition-colors">
            {product?.name || "Untitled Sneaker"}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xl font-black text-white italic">
              <span className="text-red-600 mr-1 text-sm">฿</span>
              {Number(product?.price || 0).toLocaleString()}
            </p>
            {product?.stock <= 5 && product?.stock > 0 && (
              <span className="text-[9px] font-bold text-orange-500 uppercase animate-pulse">
                Low Stock: {product.stock}
              </span>
            )}
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full bg-white text-black py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-white/5 hover:shadow-red-600/20"
        >
          <ShoppingCart size={16} strokeWidth={3} />
          <span>Add to Collection</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;