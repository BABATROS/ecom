import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Package, Trash2, Edit, Loader2, ImageOff } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base URL สำหรับ API
  const API_BASE = 'https://ecom-ghqt.onrender.com/api/products'; // เปลี่ยนจาก orders เป็น products

  // ฟังก์ชันดึง Header สำหรับ Auth
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. ฟังก์ชันดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // เรียกใช้ API สินค้า
      const res = await axios.get(API_BASE);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. ฟังก์ชันลบสินค้า
  const handleDelete = async (id) => {
    if (window.confirm('🔥 ยืนยันการลบรองเท้าคู่นี้ออกจากคลังสินค้า?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
        alert('ลบข้อมูลสำเร็จ');
        fetchProducts(); // Refresh รายการ
      } catch (err) {
        console.error("Delete Error:", err);
        alert(err.response?.data?.msg || 'ไม่สามารถลบสินค้าได้ (เช็คสิทธิ์ Admin)');
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-black italic uppercase text-red-600 tracking-tighter leading-none">
              Inventory Vault
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              SneakerHub Management Terminal
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-black hover:bg-red-600 hover:text-white px-8 py-4 rounded-[2rem] font-black text-xs transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-white/5"
          >
            <PlusCircle size={18} strokeWidth={3} />
            ADD NEW SNEAKER
          </button>
        </header>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-700">
            <Loader2 className="animate-spin mb-4" size={48} strokeWidth={3} />
            <p className="font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.length > 0 ? products.map(product => (
              <div key={product._id} className="bg-zinc-900/40 border-2 border-zinc-800/50 p-6 rounded-[2.5rem] hover:border-red-600 transition-all group relative backdrop-blur-sm">
                
                {/* Product Image Container */}
                <div className="relative aspect-square mb-6 overflow-hidden rounded-[2rem] bg-zinc-800 shadow-inner">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0].startsWith('http') 
                        ? product.images[0] 
                        : `https://ecom-ghqt.onrender.com/uploads/${product.images[0]}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/600x600/18181b/dc2626?text=IMAGE+ERROR'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                      <ImageOff size={40} />
                      <span className="text-[8px] font-black uppercase mt-2">No Media</span>
                    </div>
                  )}
                  
                  {/* Stock Badge (ถ้ามีข้อมูล stock) */}
                  {product.stock !== undefined && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <p className="text-[9px] font-bold text-white tracking-widest uppercase">Qty: {product.stock}</p>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="space-y-2 mb-6 px-1">
                  <h3 className="font-black text-lg uppercase truncate italic tracking-tighter text-white group-hover:text-red-500 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-red-600 text-xs font-black uppercase">THB</span>
                    <p className="text-2xl font-black italic tracking-tighter">
                      {Number(product.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 bg-zinc-800/50 hover:bg-white hover:text-black p-4 rounded-2xl transition-all flex items-center justify-center shadow-lg active:scale-95">
                    <Edit size={18} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-zinc-800/50 hover:bg-red-600 text-zinc-500 hover:text-white p-4 rounded-2xl transition-all flex items-center justify-center shadow-lg active:scale-95"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-800 rounded-[4rem] bg-zinc-900/10">
                <Package size={64} className="mx-auto text-zinc-800 mb-6 opacity-20" />
                <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs italic">Operational Database Empty</p>
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