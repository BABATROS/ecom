import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Package, Save, X, AlertCircle } from 'lucide-react';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const API_URL = 'https://ecom-ghqt.onrender.com/api/products';

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // เข้าสู่โหมดแก้ไข
  const startEdit = (product) => {
    setEditingId(product._id);
    setEditData({ ...product });
  };

  // ยกเลิกการแก้ไข
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // ส่งข้อมูลที่แก้ไขไป Backend
  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, editData);
      alert("อัปเดตข้อมูลสินค้าสำเร็จ!");
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  // ลบสินค้า
  const handleDelete = async (id) => {
    if (window.confirm("❗ คุณแน่ใจนะว่าจะลบสินค้าชิ้นนี้? ข้อมูลจะหายไปถาวร")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert("ลบสินค้าไม่สำเร็จ");
      }
    }
  };

  if (loading) return <div className="p-10 text-white animate-pulse">กำลังโหลดคลังสินค้า...</div>;

  return (
    <div className="min-h-screen bg-black p-6 md:p-10 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black italic text-red-600 tracking-tighter">INVENTORY</h1>
            <p className="text-zinc-500 font-bold uppercase text-xs">Edit prices, stock, and product details</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black">{products.length}</span>
            <p className="text-[10px] text-zinc-500 uppercase font-black">Items in Store</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div 
              key={product._id} 
              className={`bg-zinc-900 border ${editingId === product._id ? 'border-red-600' : 'border-zinc-800'} p-5 rounded-3xl transition-all flex flex-col md:flex-row items-center gap-6`}
            >
              {/* รูปสินค้า */}
              <div className="w-24 h-24 bg-black rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-800">
                <img 
                  src={`https://ecom-ghqt.onrender.com/uploads/${product.images[0]}`} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://placehold.co/100x100?text=No+Image'}
                />
              </div>

              {/* ข้อมูลสินค้า / ฟอร์มแก้ไข */}
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {editingId === product._id ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-black uppercase">Product Name</label>
                      <input 
                        className="bg-black border border-zinc-700 p-2 rounded-lg text-sm focus:border-red-600 outline-none"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-black uppercase">Price (฿)</label>
                      <input 
                        type="number"
                        className="bg-black border border-zinc-700 p-2 rounded-lg text-sm focus:border-red-600 outline-none"
                        value={editData.price}
                        onChange={(e) => setEditData({...editData, price: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-black uppercase">Stock Count</label>
                      <input 
                        type="number"
                        className="bg-black border border-zinc-700 p-2 rounded-lg text-sm focus:border-red-600 outline-none"
                        value={editData.stock}
                        onChange={(e) => setEditData({...editData, stock: e.target.value})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-black text-lg uppercase truncate">{product.name}</h3>
                      <p className="text-zinc-500 text-xs font-bold">{product.brand}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Price</p>
                      <p className="text-xl font-black text-white">฿{product.price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Stock</p>
                      <p className={`text-xl font-black ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {product.stock} <span className="text-xs uppercase">Pairs</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* ปุ่มจัดการ */}
              <div className="flex space-x-2">
                {editingId === product._id ? (
                  <>
                    <button onClick={() => handleUpdate(product._id)} className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition">
                      <Save size={20} />
                    </button>
                    <button onClick={cancelEdit} className="p-3 bg-zinc-800 text-zinc-400 rounded-2xl hover:text-white transition">
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(product)} className="p-3 bg-zinc-800 text-zinc-400 rounded-2xl hover:bg-white hover:text-black transition">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="p-3 bg-zinc-800 text-zinc-500 rounded-2xl hover:bg-red-600 hover:text-white transition">
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-800">
            <AlertCircle size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest italic">No products found in store.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductManager;