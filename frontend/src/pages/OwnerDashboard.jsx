import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  PackagePlus, LayoutDashboard, Trash2, ImageIcon, 
  Video as VideoIcon, Film, ClipboardList, CheckCircle2, 
  ExternalLink, Ticket, Loader2, Tag, X 
} from 'lucide-react';

const OwnerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', description: '', stock: '1'
  });
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const API_URL = 'https://ecom-ghqt.onrender.com/api';
  const BASE_SERVER_URL = 'https://ecom-ghqt.onrender.com';

  const fetchData = useCallback(async () => {
    setFetchLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/orders/all`)
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setFetchLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
    return () => imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }, [fetchData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      return alert("ลงรูปได้สูงสุด 5 รูปครับ");
    }
    
    const newFiles = [...selectedImages, ...files];
    setSelectedImages(newFiles);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || selectedImages.length === 0) {
      return alert('กรุณากรอกชื่อ ราคา และเลือกรูปภาพอย่างน้อย 1 รูป');
    }

    setLoading(true);
    const formPayload = new FormData();
    Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));
    selectedImages.forEach(file => formPayload.append('images', file));
    if (selectedVideo) formPayload.append('video', selectedVideo);

    try {
      await axios.post(`${API_URL}/products/add`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('เพิ่มสินค้าสำเร็จ!');
      setFormData({ name: '', brand: '', price: '', description: '', stock: '1' });
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]); 
      setImagePreviews([]); 
      setSelectedVideo(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("ยืนยันการลบสินค้านี้? (ลบแล้วกู้คืนไม่ได้)")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleConfirmPayment = async (orderId) => {
    if (!window.confirm("ยืนยันยอดเงินโอนถูกต้อง?")) return;
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'Paid' }); 
      fetchData();
      alert("ยืนยันสำเร็จ!");
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  if (fetchLoading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={64} />
      <p className="text-zinc-500 font-black italic animate-pulse">BOOTING STUDIO...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="bg-red-600 p-4 rounded-3xl shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Seller Studio</h1>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live Inventory Control
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/orders" className="bg-zinc-900 border border-zinc-800 hover:border-green-600 transition-all px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 group text-zinc-300">
              <ClipboardList size={18} className="group-hover:rotate-12 transition-transform text-green-500" /> 
              ORDERS CONTROL
            </Link>
            <Link to="/admin/coupons" className="bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-all px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 group text-zinc-300">
              <Ticket size={18} className="group-hover:rotate-12 transition-transform text-red-500" /> 
              COUPONS
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Side */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-800 sticky top-10 shadow-2xl">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-red-600 uppercase italic">
                <PackagePlus size={24} /> New Listing
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Product Name</label>
                  <input required type="text" className="w-full bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-2xl focus:ring-2 ring-red-600 outline-none transition-all text-white placeholder:text-zinc-600" placeholder="เช่น Nike Dunk Low Retro" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Brand</label>
                    <input type="text" className="w-full bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-2xl outline-none focus:border-red-600 text-white" placeholder="Nike" value={formData.brand} onChange={(e)=>setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Price (฿)</label>
                    <input required type="number" className="w-full bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-2xl outline-none focus:border-red-600 text-white" placeholder="3500" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Description</label>
                  <textarea className="w-full bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-2xl h-24 text-white resize-none" placeholder="บอกรายละเอียดสินค้าของคุณ..." value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-800 rounded-3xl cursor-pointer hover:border-red-600 hover:bg-red-600/5 transition-all group">
                    <ImageIcon className="text-zinc-500 group-hover:text-red-600 transition-colors" />
                    <span className="text-[9px] font-black mt-2 uppercase tracking-widest">Images ({selectedImages.length}/5)</span>
                    <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-800 rounded-3xl cursor-pointer hover:border-green-600 hover:bg-green-600/5 transition-all group relative">
                    {selectedVideo ? <CheckCircle2 className="text-green-500" /> : <VideoIcon className="text-zinc-500 group-hover:text-green-600" />}
                    <span className="text-[9px] font-black mt-2 uppercase tracking-widest">
                      {selectedVideo ? "Video Added" : "Add Video"}
                    </span>
                    <input type="file" hidden onChange={(e)=>setSelectedVideo(e.target.files[0])} accept="video/*" />
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative flex-shrink-0 group">
                        <img src={src} className="w-16 h-16 rounded-xl object-cover ring-2 ring-zinc-800" alt="preview" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-[1.5rem] font-black text-lg italic mt-8 transition-all active:scale-95 shadow-lg shadow-red-900/20 ${loading ? 'bg-zinc-700 cursor-not-allowed' : 'bg-red-600 hover:bg-white hover:text-black text-white'}`}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} /> UPLOADING...
                  </div>
                ) : 'CONFIRM LISTING'}
              </button>
            </form>
          </div>

          {/* List Side */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Pending Orders */}
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-black italic uppercase tracking-tighter text-2xl flex items-center gap-3">
                  <ClipboardList className="text-red-600" /> Verify Payments
                </h3>
                <span className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-[10px] font-black border border-red-600/20 uppercase">
                   {orders.filter(o => o.status !== 'Shipped' && o.status !== 'Cancelled').length} Actions Required
                </span>
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {orders.filter(o => o.status !== 'Shipped' && o.status !== 'Cancelled').length > 0 ? (
                  orders.filter(o => o.status !== 'Shipped' && o.status !== 'Cancelled').map((order) => (
                    <div key={order._id} className="bg-zinc-900/60 p-6 rounded-[2rem] border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-zinc-900 transition-all border-l-4 border-l-yellow-600">
                      <div className="flex items-center gap-6">
                        <div className="bg-zinc-800 p-4 rounded-2xl">
                          <CheckCircle2 className={order.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'} />
                        </div>
                        <div>
                          <p className="text-2xl font-black tracking-tight">฿{order.total?.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.user?.username || 'GUEST CUSTOMER'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        {order.paymentSlip && (
                          <a href={`${BASE_SERVER_URL}/uploads/${order.paymentSlip}`} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl text-xs font-black transition-all">
                            <ExternalLink size={14} /> VIEW SLIP
                          </a>
                        )}
                        <button onClick={() => handleConfirmPayment(order._id)} className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 px-5 py-3 rounded-xl text-xs font-black transition-all">
                          APPROVE
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-zinc-800">
                    <p className="text-zinc-600 font-black italic uppercase tracking-[0.2em] text-sm">Clean Desk. No Pending Slips.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Inventory Table */}
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-black italic uppercase tracking-tighter text-2xl flex items-center gap-3">
                  <Tag className="text-red-600" /> Active Stock
                </h3>
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total: {products.length} Items</span>
              </div>

              <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-950/50 border-b border-zinc-800">
                      <tr className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">
                        <th className="p-6">Product</th>
                        <th className="p-6 text-center">Price</th>
                        <th className="p-6 text-center">Media</th>
                        <th className="p-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {products.map((item) => (
                        <tr key={item._id} className="group hover:bg-white/5 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                                <img 
                                  src={item.images?.[0] ? `${BASE_SERVER_URL}/uploads/${item.images[0]}` : 'https://via.placeholder.com/100'} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  alt=""
                                />
                              </div>
                              <div>
                                <p className="font-black italic uppercase tracking-tight text-base leading-none mb-1">{item.name}</p>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase">{item.brand || 'No Brand'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-center font-black text-red-500 italic">
                            ฿{item.price?.toLocaleString()}
                          </td>
                          <td className="p-6">
                            <div className="flex justify-center gap-2">
                              {item.images?.length > 0 && <ImageIcon size={14} className="text-zinc-600" />}
                              {item.video && <Film size={14} className="text-green-500" />}
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <button onClick={() => handleDeleteProduct(item._id)} className="p-3 bg-zinc-800/50 hover:bg-red-600/20 hover:text-red-500 rounded-xl transition-all text-zinc-500">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                    <div className="p-20 text-center text-zinc-600 font-black italic uppercase">Warehouse is empty</div>
                  )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;