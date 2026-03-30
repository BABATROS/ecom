import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Trash2, Edit3, Save, Power, PowerOff, Plus, X, User, RotateCcw } from 'lucide-react';

const AdminCouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'percent', discountValue: 0, minCartTotal: 0 });
  
  const [userName, setUserName] = useState('Guest');
  const [userRole, setUserRole] = useState('');

  const API_URL = 'https://ecom-ghqt.onrender.com/api/coupons';

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUserName(savedUser.name || savedUser.username || 'User');
      setUserRole(savedUser.role || 'user');
    }
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, getAuthHeader());
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch coupons error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      // 🟢 ปรับ URL เป็น API_URL ตรงๆ (RESTful standard)
      await axios.post(API_URL, newCoupon, getAuthHeader());
      setShowAddModal(false);
      setNewCoupon({ code: '', discountType: 'percent', discountValue: 0, minCartTotal: 0 });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.msg || "สร้างไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("🔥 ยืนยันการลบคูปองนี้ออกจากระบบ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        fetchCoupons();
      } catch (err) {
        alert(err.response?.data?.msg || "ลบไม่สำเร็จ");
      }
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, editData, getAuthHeader());
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.msg || "แก้ไขไม่สำเร็จ");
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { active: !currentStatus }, getAuthHeader());
      fetchCoupons();
    } catch (err) {
      alert("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white italic gap-4">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black uppercase tracking-widest text-xs">Accessing Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-6 md:p-10 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* User Profile Header */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-4 bg-zinc-900/50 px-6 py-3 rounded-[2rem] border border-zinc-800 backdrop-blur-sm">
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Operator</span>
              <span className="text-sm font-black italic">{userName}</span>
            </div>
            <div className={`p-2 rounded-xl ${userRole === 'admin' ? 'bg-red-600' : 'bg-zinc-800'} shadow-lg shadow-red-600/10`}>
              <User size={18} className="text-white" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black italic text-red-600 tracking-tighter uppercase leading-none">Coupon Master</h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em] mt-2 ml-1">SneakerHub Promotion Terminal</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> INITIALIZE NEW PROMO
          </button>
        </div>

        {/* Coupon List */}
        <div className="grid gap-6">
          {coupons.length > 0 ? coupons.map((coupon) => (
            <div key={coupon._id} className={`group relative bg-zinc-900/40 border-2 ${coupon.active ? 'border-zinc-800' : 'border-red-900/20'} p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 transition-all hover:border-red-600/30 overflow-hidden`}>
              
              {/* Ticket Icon Box */}
              <div className={`p-5 rounded-[1.5rem] border ${coupon.active ? 'bg-zinc-950 border-zinc-800 text-red-600' : 'bg-red-950/20 border-red-900/30 text-zinc-700'}`}>
                <Ticket size={40} strokeWidth={2.5} />
              </div>
              
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {editingId === coupon._id ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] text-red-600 font-black uppercase tracking-widest">Edit Promo Code</label>
                    <input 
                      className="bg-black border-2 border-red-600 p-3 rounded-xl text-white outline-none font-black text-lg" 
                      value={editData.code} 
                      onChange={(e)=>setEditData({...editData, code: e.target.value.toUpperCase()})} 
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Promo Code</p>
                    <p className={`text-2xl font-black italic tracking-tighter ${!coupon.active && 'text-zinc-600'}`}>{coupon.code}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Benefit</p>
                  <p className={`text-2xl font-black ${coupon.active ? 'text-green-500' : 'text-zinc-600'}`}>
                    {coupon.discountValue.toLocaleString()} {coupon.discountType === 'percent' ? '%' : '฿'}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Access Level</p>
                  <p className={`text-2xl font-black ${!coupon.active && 'text-zinc-600'}`}>
                    <span className="text-sm font-bold text-zinc-500 mr-1 italic">Min.</span>
                    ฿{coupon.minCartTotal?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {editingId === coupon._id ? (
                  <>
                    <button onClick={() => handleUpdate(coupon._id)} className="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-600/20"><Save size={20}/></button>
                    <button onClick={() => setEditingId(null)} className="p-4 bg-zinc-800 text-white rounded-2xl hover:bg-zinc-700 transition"><RotateCcw size={20}/></button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleToggleActive(coupon._id, coupon.active)} 
                      className={`p-4 rounded-2xl transition-all ${coupon.active ? 'bg-zinc-800 text-green-500 hover:bg-green-600 hover:text-white' : 'bg-red-950 text-red-500 hover:bg-red-600 hover:text-white'}`}
                      title={coupon.active ? "Deactivate" : "Activate"}
                    >
                      {coupon.active ? <Power size={20} strokeWidth={3}/> : <PowerOff size={20} strokeWidth={3}/>}
                    </button>
                    <button onClick={() => { setEditingId(coupon._id); setEditData(coupon); }} className="p-4 bg-zinc-800 text-zinc-400 rounded-2xl hover:bg-white hover:text-black transition shadow-lg hover:shadow-white/5"><Edit3 size={20}/></button>
                    <button onClick={() => handleDelete(coupon._id)} className="p-4 bg-zinc-800 text-zinc-500 rounded-2xl hover:bg-red-600 hover:text-white transition shadow-lg hover:shadow-red-600/10"><Trash2 size={20}/></button>
                  </>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/10">
              <Ticket size={48} className="mx-auto text-zinc-800 mb-6 opacity-20" />
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs italic">Operational Database Empty</p>
            </div>
          )}
        </div>

        {/* Modal: Add Coupon */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-6">
            <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-md relative shadow-[0_0_100px_rgba(220,38,38,0.1)]">
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white hover:rotate-90 transition-all">
                <X size={28}/>
              </button>
              
              <div className="mb-8">
                <h2 className="text-3xl font-black italic text-red-600 uppercase tracking-tighter leading-none">New Promo</h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">Initialize Store Discount</p>
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block">Promotion Code</label>
                  <input 
                    required 
                    placeholder="SNEAKERHUB_50" 
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all font-black text-white uppercase placeholder:text-zinc-800" 
                    onChange={(e)=>setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block">Type</label>
                    <select 
                      className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-white appearance-none cursor-pointer" 
                      onChange={(e)=>setNewCoupon({...newCoupon, discountType: e.target.value})}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="amount">Fixed Amount (฿)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block">Value</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="0" 
                      className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all font-black text-white" 
                      onChange={(e)=>setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block">Min. Purchase (฿)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all font-black text-white" 
                    onChange={(e)=>setNewCoupon({...newCoupon, minCartTotal: Number(e.target.value)})} 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-red-600 text-white font-black py-5 rounded-[2rem] hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em] text-xs shadow-2xl shadow-red-600/20 mt-4 active:scale-95"
                >
                  Activate Coupon
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCouponManager;