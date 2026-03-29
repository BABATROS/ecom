import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle, AlertCircle, UploadCloud, Loader2 } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    const userId = userData?.id || userData?._id;
    if (!userId) return;

    try {
      setLoading(true);
      // เปลี่ยน URL เป็นของ Render เรียบร้อยแล้ว
      const res = await axios.get(`https://ecom-ghqt.onrender.com/api/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
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
      await axios.put(`https://ecom-ghqt.onrender.com/api/orders/${orderId}/upload-slip`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      alert('อัปโหลดสลิปสำเร็จ!');
      fetchOrders();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-6xl font-black italic tracking-tighter mb-12 border-l-8 border-red-600 pl-6">MY ORDERS</h1>
        
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-zinc-700 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Package className="text-red-600" />
                      <span className="font-mono text-zinc-500 text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase italic ${
                        order.status === 'Pending' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="relative group">
                           <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-2xl border border-zinc-800" />
                           <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                             {item.quantity}
                           </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Total Amount</p>
                    <p className="text-4xl font-black italic text-white">฿{order.total.toLocaleString()}</p>
                    
                    {order.status === 'Pending' && (
                       <div className="mt-4">
                         <input 
                           type="file" 
                           id={`slip-${order._id}`} 
                           className="hidden" 
                           onChange={(e) => uploadSlip(order._id, e.target.files[0])}
                         />
                         <label 
                           htmlFor={`slip-${order._id}`}
                           className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-black text-xs cursor-pointer hover:bg-red-600 hover:text-white transition-all"
                         >
                           {uploadingId === order._id ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                           ATTACH SLIP
                         </label>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/30 rounded-[4rem] border-2 border-dashed border-zinc-800">
            <AlertCircle className="mx-auto mb-6 text-zinc-800" size={64} />
            <p className="text-zinc-600 text-2xl italic uppercase font-black">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;