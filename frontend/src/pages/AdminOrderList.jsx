import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, Trash2, Package, Clock, ExternalLink, ShieldCheck, Truck } from 'lucide-react';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const API_BASE_URL = 'https://ecom-ghqt.onrender.com/api/orders';

  // ฟังก์ชันดึง Token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // เพิ่ม getAuthHeader() เพื่อความปลอดภัย
      const res = await axios.get(`${API_BASE_URL}/all`, getAuthHeader());
      setOrders(Array.isArray(res.data) ? res.data : []);
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
      await axios.put(`${API_BASE_URL}/${id}/status`, { status: newStatus }, getAuthHeader());
      // อัปเดต state ทันทีเพื่อให้ UI ลื่นไหล (Optimistic Update)
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("ไม่สามารถอัปเดตสถานะได้: " + (err.response?.data?.msg || "Server Error"));
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("❗ คำเตือน: การลบออเดอร์ไม่สามารถย้อนกลับได้ ยืนยันการลบ?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, getAuthHeader());
      setOrders(orders.filter(order => order._id !== id));
    } catch (err) {
      alert("ลบออเดอร์ไม่สำเร็จ");
    }
  };

  // Logic สำหรับดึง URL รูปสลิป
  const getSlipUrl = (slipPath) => {
    if (!slipPath) return null;
    return slipPath.startsWith('http') 
      ? slipPath 
      : `https://ecom-ghqt.onrender.com/uploads/${slipPath}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600 border-zinc-800"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Accessing Order Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-6 md:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black italic text-red-600 tracking-tighter uppercase leading-none">Order Control</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3 flex items-center">
              <ShieldCheck size={14} className="mr-2 text-red-600" /> Secure Admin Terminal
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 min-w-[140px] shadow-xl">
               <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Total Orders</p>
               <p className="text-2xl font-black italic mt-1">{orders.length}</p>
            </div>
            <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 min-w-[140px] shadow-xl border-l-yellow-600/50">
               <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest text-yellow-500">Pending</p>
               <p className="text-2xl font-black italic mt-1 text-yellow-500">
                {orders.filter(o => o.status.toLowerCase().includes('pending') || o.status.toLowerCase().includes('waiting')).length}
               </p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 uppercase text-[9px] font-black tracking-[0.2em]">
                  <th className="p-8">Customer / ID</th>
                  <th className="p-8">Items</th>
                  <th className="p-8">Total</th>
                  <th className="p-8">Status</th>
                  <th className="p-8 text-center">Payment</th>
                  <th className="p-8 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="p-8">
                      <p className="font-black text-lg tracking-tight uppercase group-hover:text-red-500 transition-colors">
                        {order.user?.username || order.customerName || 'Guest User'}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-mono mt-1">ID: {order._id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col gap-1.5">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-[11px] text-zinc-400 font-bold flex items-center bg-zinc-800/50 px-3 py-1 rounded-full w-fit">
                            <Package size={10} className="mr-2 text-red-600" /> 
                            {item.product?.name || 'Unknown Item'} <span className="text-white ml-2">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-xl font-black italic tracking-tighter">
                        <span className="text-red-600 text-xs mr-1 uppercase font-black italic">THB</span>
                        {order.total?.toLocaleString()}
                      </p>
                    </td>
                    <td className="p-8">
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        order.status === 'Paid' ? 'bg-green-500 text-white' : 
                        order.status.includes('Pending') ? 'bg-yellow-500 text-black' : 
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Clock size={12} className="mr-2" /> {order.status}
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      {order.paymentSlip ? (
                        <button 
                          onClick={() => setSelectedSlip(getSlipUrl(order.paymentSlip))}
                          className="bg-zinc-800 p-3.5 rounded-2xl hover:bg-white hover:text-black transition-all active:scale-90 shadow-lg"
                        >
                          <Eye size={20} strokeWidth={2.5} />
                        </button>
                      ) : (
                        <span className="text-[9px] text-zinc-700 font-black italic tracking-widest">UNPAID</span>
                      )}
                    </td>
                    <td className="p-8">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => updateStatus(order._id, 'Paid')}
                          className="p-3.5 bg-zinc-800 text-green-500 rounded-2xl hover:bg-green-500 hover:text-white transition-all shadow-lg active:scale-90"
                          title="Verify & Mark as Paid"
                        >
                          <CheckCircle size={20} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => updateStatus(order._id, 'Shipped')}
                          className="p-3.5 bg-zinc-800 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-90"
                          title="Mark as Shipped"
                        >
                          <Truck size={20} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => deleteOrder(order._id)}
                          className="p-3.5 bg-zinc-800 text-zinc-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-90"
                        >
                          <Trash2 size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
             <div className="py-32 text-center">
                <Package size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">No transactions in database</p>
             </div>
          )}
        </div>
      </div>

      {/* --- Slip Modal --- */}
      {selectedSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="relative max-w-lg w-full bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 p-3 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <button 
              onClick={() => setSelectedSlip(null)}
              className="absolute top-6 right-6 z-10 bg-black/60 backdrop-blur-md p-3 rounded-full hover:bg-red-600 transition-all text-white"
            >
              <XCircle size={24} />
            </button>
            <div className="max-h-[70vh] overflow-y-auto rounded-[2rem]">
                <img src={selectedSlip} alt="Payment Slip" className="w-full h-auto object-contain" />
            </div>
            <div className="p-6 text-center">
              <a 
                href={selectedSlip} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 bg-zinc-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Inspect Original <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;