import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  PackagePlus, 
  LayoutDashboard, 
  Trash2, 
  Tag, 
  DollarSign, 
  Image as ImageIcon, 
  TextQuote, 
  Ticket,
  Video as VideoIcon, 
  Film,
  ClipboardList,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const OwnerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // ✅ เพิ่ม State เก็บออเดอร์
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', description: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://ecom-ghqt.onrender.com/api/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setProducts([]); 
    }
  };

  // ✅ ดึงข้อมูลออเดอร์ทั้งหมด
  const fetchOrders = async () => {
    try {
      const res = await axios.get('https://ecom-ghqt.onrender.com/api/orders/all');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders(); // ✅ โหลดออเดอร์เมื่อเปิดหน้า
  }, []);

  // ✅ ฟังก์ชันยืนยันยอดเงิน
  const handleConfirmPayment = async (orderId) => {
    if (!window.confirm("ยืนยันว่าได้รับยอดชำระเงินถูกต้องแล้วใช่หรือไม่?")) return;
    try {
      await axios.put(`https://ecom-ghqt.onrender.com/api/orders/${orderId}/confirm`);
      alert("ยืนยันออเดอร์สำเร็จ!");
      fetchOrders(); // รีโหลดข้อมูล
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการยืนยัน");
    }
  };

  // ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    try {
      await axios.delete(`https://ecom-ghqt.onrender.com/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    setImagePreviews([]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedVideo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price || selectedImages.length === 0) {
      alert('กรุณากรอกข้อมูลให้ครบ'); return;
    }
    setLoading(true);
    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));
      formPayload.append('stock', '1');
      selectedImages.forEach((file) => formPayload.append('images', file));
      if (selectedVideo) formPayload.append('video', selectedVideo);

      await axios.post('https://ecom-ghqt.onrender.com/api/products/add', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('เพิ่มสินค้าสำเร็จ!');
      setFormData({ name: '', brand: '', price: '', description: '' });
      setSelectedImages([]); setImagePreviews([]); setSelectedVideo(null);
      fetchProducts();
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header ส่วนเดิม */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Seller Studio</h1>
              <p className="text-zinc-500 text-sm">จัดการสต็อกและตรวจสอบการโอนเงิน</p>
            </div>
          </div>
          <Link to="/manage-coupons" className="inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-3xl font-bold text-sm hover:bg-slate-700 transition">
            <Ticket size={18} /> Manage Coupons
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ฝั่งซ้าย: ฟอร์มเพิ่มสินค้า (ส่วนเดิม) */}
          <div className="lg:col-span-4">
             <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 sticky top-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500 uppercase"><PackagePlus size={22} /> List Product</h2>
                <div className="space-y-3">
                  <input type="text" placeholder="Product Name" className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                  <input type="text" placeholder="Brand" className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700" value={formData.brand} onChange={(e)=>setFormData({...formData, brand: e.target.value})} />
                  <input type="number" placeholder="Price" className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} />
                  <textarea placeholder="Description" className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 h-20" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col items-center p-3 border border-dashed border-zinc-700 rounded-2xl bg-zinc-900 cursor-pointer hover:border-red-500">
                      <ImageIcon size={20} /> <span className="text-[10px] mt-1">Images</span>
                      <input type="file" multiple hidden onChange={handleImageChange} />
                    </label>
                    <label className="flex flex-col items-center p-3 border border-dashed border-zinc-700 rounded-2xl bg-zinc-900 cursor-pointer hover:border-red-500">
                      <VideoIcon size={20} /> <span className="text-[10px] mt-1">Video</span>
                      <input type="file" hidden onChange={handleVideoChange} />
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black mt-6 hover:bg-white hover:text-black transition-all">
                  {loading ? 'PROCESSING...' : 'CONFIRM LISTING'}
                </button>
             </form>
          </div>

          {/* ฝั่งขวา: รายการออเดอร์ และ รายการสินค้า */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 📦 ส่วนใหม่: Order Management (โชว์เฉพาะที่ต้องจัดการ) */}
            <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <h3 className="font-bold text-lg uppercase flex items-center gap-2"><ClipboardList className="text-red-500"/> Order Requests</h3>
                <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold">
                  {orders.filter(o => o.status === 'Paid').length} New Payments
                </span>
              </div>
              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {orders.filter(o => o.status === 'Paid' || o.status === 'Pending').length > 0 ? (
                  orders.filter(o => o.status === 'Paid' || o.status === 'Pending').map((order) => (
                    <div key={order._id} className="bg-zinc-800/50 p-5 rounded-3xl border border-zinc-700 flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${order.status === 'Paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
                            {order.status}
                          </span>
                          <span className="text-zinc-500 text-xs">ID: {order._id.slice(-6)}</span>
                        </div>
                        <p className="font-bold text-lg">฿{order.total.toLocaleString()}</p>
                        <p className="text-sm text-zinc-400">Buyer: {order.user?.username || 'Guest'}</p>
                      </div>

                      {order.paymentSlip && (
                        <div className="flex items-center gap-4">
                          <a href={`https://ecom-ghqt.onrender.com/uploads/${order.paymentSlip}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                            <ExternalLink size={14}/> View Slip
                          </a>
                          <button 
                            onClick={() => handleConfirmPayment(order._id)}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
                          >
                            <CheckCircle2 size={16}/> Confirm
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-zinc-500 italic">No pending orders.</p>
                )}
              </div>
            </div>

            {/* ตารางสินค้า (ส่วนเดิมของคุณ) */}
            <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-zinc-800">
                <h3 className="font-bold text-lg uppercase tracking-widest">Inventory List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase">
                    <tr>
                      <th className="p-5 text-left">Sneaker</th>
                      <th className="p-5 text-center">Price</th>
                      <th className="p-5 text-center">Media</th>
                      <th className="p-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {products.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-800/50 transition">
                        <td className="p-5 flex items-center gap-4">
                          <img 
                            src={item.images?.[0] ? `https://ecom-ghqt.onrender.com/uploads/${item.images[0]}` : 'https://via.placeholder.com/100'} 
                            className="w-10 h-10 rounded-lg object-cover" 
                          />
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-[10px] text-zinc-500">{item.brand}</p>
                          </div>
                        </td>
                        <td className="p-5 text-center text-red-500 font-mono font-bold">฿{item.price}</td>
                        <td className="p-5 text-center">
                          <div className="flex justify-center gap-2">
                            {item.images?.length > 0 && <ImageIcon size={14} className="text-zinc-500"/>}
                            {item.video && <Film size={14} className="text-green-500"/>}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <button onClick={() => handleDeleteProduct(item._id)} className="p-2 hover:text-red-500 transition">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;