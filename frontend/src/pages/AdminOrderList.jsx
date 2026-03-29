import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, Trash2, Package, Clock, ExternalLink } from 'lucide-react';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null); // เก็บ URL รูปสลิปที่จะโชว์ใน Modal

  const API_BASE_URL = 'https://ecom-ghqt.onrender.com/api/orders';

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/all`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, newStatus) => {
    if (!window.confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${newStatus}?`)) return;
    try {
      await axios.put(`${API_BASE_URL}/${id}/status`, { status: newStatus });
      fetchOrders(); // รีโหลดข้อมูล
    } catch (err) {
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("❗ คำเตือน: การลบออเดอร์ไม่สามารถย้อนกลับได้ ยืนยันการลบ?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setOrders(orders.filter(order => order._id !== id));
    } catch (err) {
      alert("ลบออเดอร์ไม่สำเร็จ");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4 md:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black italic text-red-600 tracking-tighter">ORDER CONTROL</h1>
            <p className="text-zinc-500 font-bold uppercase text-xs mt-1">Manage payments and shipping status</p>
          </div>
          <div className="bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800 flex items-center space-x-4">
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-black">Total Orders</p>
              <p className="text-xl font-black">{orders.length}</p>
            </div>
            <div className="w-[1px] h-8 bg-zinc-800"></div>
            <div className="text-center text-yellow-500">
              <p className="text-[10px] text-zinc-500 uppercase font-black">Pending</p>
              <p className="text-xl font-black">
                {orders.filter(o => o.status.includes('Pending') || o.status.includes('Waiting')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="p-6">Customer / ID</th>
                  <th className="p-6">Order Details</th>
                  <th className="p-6">Total Amount</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Payment Slip</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="font-black text-lg">{order.user?.username || 'Guest'}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-1">#{order._id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        {order.items?.map((item, idx) => (
                          <span key={idx} className="text-xs text-zinc-400 flex items-center">
                            <Package size={12} className="mr-1" /> {item.product?.name} (x{item.quantity})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-xl font-black text-white">฿{order.total?.toLocaleString()}</span>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 
                        order.status === 'Pending Verification' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Clock size={12} className="mr-1" /> {order.status}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      {order.paymentSlip ? (
                        <button 
                          onClick={() => setSelectedSlip(order.paymentSlip)}
                          className="bg-zinc-800 p-3 rounded-xl hover:bg-red-600 transition-colors group"
                        >
                          <Eye size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-700 font-black italic">NO SLIP</span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => updateStatus(order._id, 'Paid')}
                          className="p-3 bg-white text-black rounded-xl hover:bg-green-500 hover:text-white transition-all"
                          title="Verify Payment"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => deleteOrder(order._id)}
                          className="p-3 bg-zinc-800 text-zinc-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Slip Modal --- */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-800 p-2">
            <button 
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-red-600 transition"
            >
              <XCircle size={24} />
            </button>
            <img src={selectedSlip} alt="Payment Slip" className="w-full h-auto rounded-2xl" />
            <div className="p-4 text-center">
              <a href={selectedSlip} target="_blank" rel="noreferrer" className="text-zinc-500 text-xs flex items-center justify-center hover:text-white">
                View Full Image <ExternalLink size={12} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;