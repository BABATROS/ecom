import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PackagePlus, LayoutDashboard, Trash2, ImageIcon, 
  Video as VideoIcon, Ticket, Loader2, Tag, Edit3, X, Save, AlertCircle
} from 'lucide-react';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', description: '', stock: '1'
  });
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const BASE_URL = 'https://ecom-ghqt.onrender.com';
  const API_URL = `${BASE_URL}/api`;

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchData = useCallback(async () => {
    setFetchLoading(true);
    try {
      const config = getAuthConfig();
      // ดึงเฉพาะสินค้าที่เป็นของ Owner คนนี้
      const res = await axios.get(`${API_URL}/products/my-products`, config);
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setFetchLoading(false);
    }
  }, [API_URL, getAuthConfig, navigate]);

  useEffect(() => {
    fetchData();
    return () => imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }, [fetchData]);

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      brand: product.brand || '',
      price: product.price.toString(),
      description: product.description || '',
      stock: product.stock.toString()
    });
    // ล้าง preview เก่าเมื่อสลับมาโหมดแก้ไข
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]); 
    setSelectedImages([]);
    setSelectedVideo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', brand: '', price: '', description: '', stock: '1' });
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
    setSelectedVideo(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) return alert("จำกัดสูงสุด 5 รูป");
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return alert('กรุณากรอกข้อมูลชื่อและราคา');

    setLoading(true);
    const formPayload = new FormData();
    
    // Append ข้อมูล Text
    Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));
    
    // Append รูปภาพ
    selectedImages.forEach(file => formPayload.append('images', file));
    if (selectedVideo) formPayload.append('video', selectedVideo);

    try {
      const config = {
        headers: { 
          ...getAuthConfig().headers,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingId) {
        // [PUT] แก้ไขสินค้า
        await axios.put(`${API_URL}/products/${editingId}`, formPayload, config);
        alert('อัปเดตข้อมูลสินค้าสำเร็จ!');
      } else {
        // [POST] เพิ่มสินค้าใหม่ (เช็ครูปภาพเฉพาะตอนเพิ่มใหม่)
        if (selectedImages.length === 0) {
          setLoading(false);
          return alert('กรุณาเลือกรูปภาพอย่างน้อย 1 รูปสำหรับสินค้าใหม่');
        }
        await axios.post(`${API_URL}/products`, formPayload, config);
        alert('เพิ่มสินค้าใหม่สำเร็จ!');
      }

      resetForm();
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.msg || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้าชิ้นนี้?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/products/${id}`, getAuthConfig());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "ไม่สามารถลบสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <p className="text-zinc-500 font-black italic uppercase tracking-widest">Synchronizing Inventory...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-zinc-900 pb-10">
          <div className="flex items-center gap-5">
            <div className="bg-red-600 p-4 rounded-3xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Studio Dashboard</h1>
              <p className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase font-bold italic">Management Interface</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/orders" className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-white hover:text-black transition-all uppercase">Orders List</Link>
            <Link to="/admin/coupons" className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl font-black text-[10px] flex items-center gap-2 hover:border-red-600 transition-all text-red-500 uppercase">
              <Ticket size={16} /> Coupons
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Column */}
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className={`bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 transition-all duration-500 sticky top-10 ${editingId ? 'border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.15)]' : 'border-zinc-800 shadow-2xl'}`}>
              <div className="flex justify-between items-center mb-8">
                <h2 className={`text-xl font-black italic uppercase flex items-center gap-2 ${editingId ? 'text-blue-500' : 'text-red-600'}`}>
                  {editingId ? <Edit3 size={20}/> : <PackagePlus size={20}/>} {editingId ? 'Edit Product' : 'New Listing'}
                </h2>
                {editingId && (
                  <button type="button" onClick={resetForm} className="text-zinc-500 hover:text-white flex items-center gap-1 text-[10px] font-black uppercase transition-colors">
                    Cancel <X size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 italic">Product Name</label>
                  <input required placeholder="E.g. Jordan 1 Retro" className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 italic">Brand</label>
                    <input placeholder="Nike" className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all" value={formData.brand} onChange={(e)=>setFormData({...formData, brand: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 italic">Price (฿)</label>
                    <input required type="number" placeholder="0.00" className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all text-red-500 font-bold" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 italic">Inventory Stock</label>
                  <input required type="number" className="w-full bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-red-600 transition-all" value={formData.stock} onChange={(e)=>setFormData({...formData, stock: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 italic">Description</label>
                  <textarea placeholder="Product details..." className="w-full bg-black p-4 rounded-2xl h-24 outline-none border border-zinc-800 focus:border-red-600 transition-all resize-none text-zinc-400 text-sm italic" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <label className="flex flex-col items-center p-4 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-red-600 hover:bg-red-600/5 transition-all">
                      <ImageIcon size={20} className={selectedImages.length > 0 ? "text-red-500" : "text-zinc-500"} />
                      <span className="text-[9px] mt-2 font-black uppercase tracking-tighter">Images ({selectedImages.length}/5)</span>
                      <input type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
                   </label>
                   <label className="flex flex-col items-center p-4 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-green-600 hover:bg-green-600/5 transition-all">
                      <VideoIcon size={20} className={selectedVideo ? "text-green-500" : "text-zinc-500"} />
                      <span className="text-[9px] mt-2 font-black uppercase tracking-tighter">{selectedVideo ? "Video Ready" : "Add Video"}</span>
                      <input type="file" hidden accept="video/*" onChange={(e) => setSelectedVideo(e.target.files[0])} />
                   </label>
                </div>

                {/* Media Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative flex-shrink-0 group">
                        <img src={src} className="w-14 h-14 rounded-xl object-cover border border-zinc-700" alt="preview" />
                        <button type="button" onClick={() => {
                          URL.revokeObjectURL(imagePreviews[i]);
                          setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
                          setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                        }} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button disabled={loading} className={`w-full py-5 rounded-2xl font-black italic mt-8 transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-white hover:text-blue-600' : 'bg-red-600 hover:bg-white hover:text-black'}`}>
                {loading ? <Loader2 className="animate-spin" /> : (editingId ? <><Save size={18}/> UPDATE PRODUCT</> : <><PackagePlus size={18}/> PUBLISH NOW</>)}
              </button>
            </form>
          </div>

          {/* Warehouse Column */}
          <div className="lg:col-span-8">
            <h3 className="text-2xl font-black italic flex items-center gap-3 uppercase tracking-tighter mb-6">
              <Tag className="text-red-600" fill="currentColor" size={20}/> Warehouse <span className="text-zinc-600 text-lg">({products.length})</span>
            </h3>

            <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] font-black uppercase text-zinc-500 italic">
                    <tr>
                      <th className="p-6">Product Details</th>
                      <th className="p-6 text-center">Price</th>
                      <th className="p-6 text-center">Status</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {products.map(item => (
                      <tr key={item._id} className={`hover:bg-white/[0.02] transition-all group ${editingId === item._id ? 'bg-blue-600/5' : ''}`}>
                        <td className="p-6 flex items-center gap-4">
                          <img 
                            src={item.images?.[0] ? `${BASE_URL}/uploads/${item.images[0]}` : "https://placehold.co/400x400/18181b/dc2626?text=Sneaker"} 
                            className={`w-16 h-16 rounded-2xl object-cover border transition-all ${editingId === item._id ? 'border-blue-600 scale-105' : 'border-zinc-800'}`} 
                            alt={item.name}
                            onError={(e) => { e.target.src = "https://placehold.co/400x400/18181b/dc2626?text=Sneaker"; }}
                          />
                          <div>
                            <p className={`font-black uppercase italic text-sm ${editingId === item._id ? 'text-blue-400' : ''}`}>{item.name}</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{item.brand || 'Unbranded'}</p>
                          </div>
                        </td>
                        <td className="p-6 text-center font-black italic text-lg">฿{Number(item.price).toLocaleString()}</td>
                        <td className="p-6 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${item.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {item.stock > 0 ? `${item.stock} IN STOCK` : 'OUT OF STOCK'}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleEditClick(item)} className="p-3 bg-zinc-800/50 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(item._id)} className="p-3 bg-zinc-800/50 text-zinc-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {products.length === 0 && (
                <div className="p-32 text-center text-zinc-600 text-xs font-black uppercase tracking-[0.3em]">
                  No products in warehouse.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;