import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Package, Trash2, Edit, Loader2 } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. ฟังก์ชันดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://ecom-ghqt.onrender.com/api/orders');
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. ฟังก์ชันลบสินค้า (เพิ่มเพื่อให้ปุ่มถังขยะใช้งานได้)
  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) {
      try {
        await axios.delete(`https://ecom-ghqt.onrender.com/api/orders/${id}`);
        alert('ลบสินค้าสำเร็จ');
        fetchProducts(); // โหลดรายการใหม่
      } catch (err) {
        alert('ไม่สามารถลบสินค้าได้');
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-black italic uppercase text-red-600 tracking-tighter">Admin Panel</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Inventory Control</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-white hover:text-black px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
          >
            <PlusCircle size={20} />
            ADD NEW SNEAKER
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest">Loading Vault...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? products.map(product => (
              <div key={product._id} className="bg-zinc-900 p-5 rounded-[2.5rem] border border-zinc-800 hover:border-red-600/50 transition-all group relative">
                {/* Product Image */}
                <div className="aspect-square mb-4 overflow-hidden rounded-3xl bg-zinc-800">
                  <img 
                    src={product.images?.[0] ? `https://ecom-ghqt.onrender.com/api/orders/${product.images[0]}` : 'https://placehold.co/400x400?text=No+Image'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={product.name}
                  />
                </div>

                {/* Info */}
                <div className="space-y-1 mb-4">
                  <h3 className="font-bold uppercase truncate pr-2">{product.name}</h3>
                  <p className="text-red-500 font-black text-xl italic">฿{Number(product.price).toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl transition flex items-center justify-center">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-zinc-800 hover:bg-red-600 text-zinc-500 hover:text-white p-3 rounded-xl transition flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
                <Package size={48} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-600 italic font-medium">The vault is currently empty.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal สำหรับเพิ่มสินค้า */}
        {isModalOpen && (
          <AddProductModal 
            onClose={() => { 
              setIsModalOpen(false); 
              fetchProducts(); 
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;