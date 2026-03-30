import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. เพิ่มการ Import useNavigate
import { Package, Clock, CheckCircle, AlertCircle, UploadCloud, Loader2, ArrowRight, CreditCard } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  
  const navigate = useNavigate(); // 2. ประกาศตัวแปร navigate เพื่อใช้งาน

  const userData = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const API_URL = 'https://ecom-ghqt.onrender.com/api/orders';

  const fetchOrders = async () => {
    // ตรวจสอบทั้ง id และ _id เพื่อความชัวร์
    const userId = userData?.id || userData?._id; 
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // เรียงจากออเดอร์ล่าสุดขึ้นก่อน
      const sortedOrders = Array.isArray(res.data) ? [...res.data].reverse() : [];
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const uploadSlip = async (orderId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('slip', file);

    try {
      setUploadingId(orderId);
      await axios.put(`${API_URL}/${orderId}/upload-slip`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      await fetchOrders();
    } catch (err) {
      alert('การอัปโหลดขัดข้อง โปรดลองใหม่อีกครั้ง');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">Retrieving History...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-red-600">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-16">
            <div className="flex items-center gap-3 text-red-600 mb-2">
                <Clock size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Order History</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none uppercase">
                MY <span className="text-red-600">ORDERS</span>
            </h1>
        </header>
        
        {orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="group relative bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-[3rem] p-8 md:p-10 transition-all duration-500 hover:border-red-600/30 shadow-2xl overflow-hidden">
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -mr-32 -mt-32"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-8">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-zinc-800 px-5 py-2 rounded-2xl border border-zinc-700">
                        <span className="font-mono text-white text-xs font-bold tracking-widest uppercase">
                            #{order._id.slice(-8)}
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest italic ${
                        order.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                        order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {order.status === 'Pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {order.status}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="relative group/item">
                           <div className="w-24 h-28 bg-black rounded-3xl overflow-hidden border border-zinc-800 group-hover/item:border-red-600/50 transition-all duration-500">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-700" />
                           </div>
                           <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg italic">
                             x{item.quantity}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:w-80 flex flex-col justify-between items-end gap-6 text-right">
                    <div className="space-y-1">
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">Grand Total</p>
                      <h3 className="text-5xl font-black italic text-white tracking-tighter">
                        ฿{order.total?.toLocaleString() || '0'}
                      </h3>
                    </div>
                    
                    <div className="w-full">
                      {order.status === 'Pending' && !order.slipUploaded ? (
                        <div className="flex flex-col gap-3">
                           <input 
                             type="file" 
                             id={`slip-${order._id}`} 
                             className="hidden" 
                             accept="image/*"
                             onChange={(e) => uploadSlip(order._id, e.target.files[0])}
                           />
                           <label 
                             htmlFor={`slip-${order._id}`}
                             className={`group w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black italic text-xs tracking-widest cursor-pointer transition-all duration-300 transform active:scale-95 shadow-xl ${
                               uploadingId === order._id 
                               ? 'bg-zinc-800 text-zinc-500' 
                               : 'bg-white text-black hover:bg-red-600 hover:text-white'
                             }`}
                           >
                             {uploadingId === order._id ? (
                               <Loader2 className="animate-spin" size={18} />
                             ) : (
                               <UploadCloud size={18} className="group-hover:-translate-y-1 transition-transform" />
                             )}
                             {uploadingId === order._id ? 'UPLOADING...' : 'ATTACH SLIP'}
                           </label>
                           <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center">
                             Please attach payment proof to verify.
                           </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2 text-zinc-500">
                           <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl text-green-500 border border-green-500/20">
                              <CreditCard size={14} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Payment Completed</span>
                           </div>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 italic">Order is being processed</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-zinc-800/50 backdrop-blur-sm">
             <div className="bg-zinc-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-2xl">
                <Package className="text-zinc-800" size={40} />
             </div>
             <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-500 mb-2">No History</h2>
             <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-8">
               You haven't made any drops yet.
             </p>
             <button 
               onClick={() => navigate('/')} // 3. ปุ่มนี้จะทำงานได้ปกติแล้ว
               className="bg-white text-black px-8 py-4 rounded-2xl font-black italic uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl"
             >
               Go to Store
             </button>
          </div>
        )}

        <div className="mt-20 text-center opacity-20">
            <p className="text-[9px] font-black uppercase tracking-[0.8em]">SNKR HUB // AUTHENTIC UNIT</p>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;