import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Trash2, Edit3, Save, Power, PowerOff, Plus, X } from 'lucide-react';

const AdminCouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'percent', discountValue: 0, minCartTotal: 0 });

  const API_URL = 'https://ecom-ghqt.onrender.com/api/coupons';

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(API_URL);
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch coupons error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/add`, newCoupon);
      setShowAddModal(false);
      setNewCoupon({ code: '', discountType: 'percent', discountValue: 0, minCartTotal: 0 });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.msg || "สร้างคูปองไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันการลบคูปองนี้?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCoupons();
      } catch (err) {
        alert("ลบไม่สำเร็จ");
      }
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, editData);
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      alert("แก้ไขไม่สำเร็จ");
    }
  };

  if (loading) return <div className="p-10 text-white italic">กำลังโหลดข้อมูลคูปอง...</div>;

  return (
    <div className="min-h-screen bg-black p-6 md:p-10 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black italic text-red-600 tracking-tighter uppercase">Coupon Master</h1>
            <p className="text-zinc-500 font-bold text-xs uppercase">Manage discounts and promotions</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-white text-black px-6 py-2 rounded-full font-black text-xs hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
          >
            <Plus size={16} /> NEW COUPON
          </button>
        </div>

        {/* ตารางแสดงรายการคูปอง */}
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <div key={coupon._id} className={`bg-zinc-900 border ${coupon.active ? 'border-zinc-800' : 'border-red-900/30'} p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6`}>
              <div className="bg-black p-4 rounded-2xl border border-zinc-800 text-red-600"><Ticket size={32} /></div>
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-center md:text-left">
                {editingId === coupon._id ? (
                   <input className="bg-black border border-zinc-700 p-2 rounded-xl" value={editData.code} onChange={(e)=>setEditData({...editData, code: e.target.value.toUpperCase()})} />
                ) : (
                  <div><p className="text-[10px] text-zinc-500 font-black uppercase">Promo Code</p><p className="text-xl font-black">{coupon.code}</p></div>
                )}
                {/* ... (ส่วนแสดงผล Discount และ Min. Spend เหมือนเดิมแต่เพิ่มการตรวจสอบข้อมูล) ... */}
                <div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase">Discount</p>
                  <p className="text-xl font-black text-green-500">{coupon.discountValue} {coupon.discountType === 'percent' ? '%' : '฿'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(coupon._id)} className="p-3 bg-zinc-800 text-zinc-500 rounded-xl hover:bg-red-600 hover:text-white transition"><Trash2 size={20}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal สำหรับเพิ่มคูปองใหม่ */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-md relative">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
              <h2 className="text-2xl font-black italic text-red-600 mb-6 uppercase italic tracking-tighter">Create New Coupon</h2>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <input required placeholder="COUPON CODE (e.g. SNEAKER20)" className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600" onChange={(e)=>setNewCoupon({...newCoupon, code: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none" onChange={(e)=>setNewCoupon({...newCoupon, discountType: e.target.value})}>
                    <option value="percent">Percentage (%)</option>
                    <option value="amount">Fixed Amount (฿)</option>
                  </select>
                  <input type="number" required placeholder="Value" className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600" onChange={(e)=>setNewCoupon({...newCoupon, discountValue: e.target.value})} />
                </div>
                <input type="number" placeholder="Min. Spend (฿)" className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600" onChange={(e)=>setNewCoupon({...newCoupon, minCartTotal: e.target.value})} />
                <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest">Activate Coupon</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCouponManager;