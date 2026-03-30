import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, Upload, X, Package, DollarSign, Database, Info } from 'lucide-react';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // States สำหรับจัดการข้อมูล
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        description: '', 
        stock: '' 
    });
    
    const [existingImages, setExistingImages] = useState([]); // รูปเดิมจาก DB
    const [selectedImage, setSelectedImage] = useState(null);  // ไฟล์รูปใหม่ที่เลือก
    const [preview, setPreview] = useState(null);             // ตัวอย่างรูปใหม่

    const API_URL = 'https://ecom-ghqt.onrender.com/api/products';
    const IMAGE_BASE_URL = 'https://ecom-ghqt.onrender.com/uploads/';
    const token = localStorage.getItem('token');

    // 1. ดึงข้อมูลสินค้าเดิมมาแสดง
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/${id}`);
                const data = res.data;
                
                setFormData({
                    name: data.name || '',
                    price: data.price || '',
                    description: data.description || '',
                    stock: data.stock || '0'
                });
                setExistingImages(data.images || []);
            } catch (err) {
                console.error("Fetch error:", err);
                alert("ไม่สามารถดึงข้อมูลสินค้าได้");
                navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    // 2. จัดการเมื่อเลือกรูปภาพใหม่
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file)); // สร้าง Preview ชั่วคราว
        }
    };

    // 3. ฟังก์ชันส่งข้อมูลไปอัปเดต (ใช้ FormData)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('stock', formData.stock);
        
        if (selectedImage) {
            // ส่งรูปใหม่ไปที่ Field 'images' ตามที่ Backend/Multer รอรับ
            data.append('images', selectedImage);
        }

        try {
            await axios.put(`${API_URL}/${id}`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            alert("✅ อัปเดตข้อมูลสินค้าเรียบร้อย!");
            navigate('/admin/products'); // กลับไปหน้าจัดการ
        } catch (err) {
            console.error("Update error:", err);
            alert("❌ แก้ไขไม่สำเร็จ: " + (err.response?.data?.message || "Server Error"));
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-black italic">
            <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
            <p className="tracking-[0.3em] animate-pulse">RECALLING SPECS...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-600 pb-20">
            {/* Header Area */}
            <div className="container mx-auto px-6 pt-12 flex items-center justify-between mb-12">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all">
                    <div className="p-3 rounded-full border border-zinc-800 group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-black uppercase italic tracking-widest text-[10px]">Back to Warehouse</span>
                </button>
                <div className="text-right">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Edit<span className="text-red-600">Product</span></h1>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.5em] mt-2">Product ID: {id}</p>
                </div>
            </div>

            <main className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Side: Image Preview */}
                <div className="space-y-6">
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-zinc-900 border border-zinc-800 group shadow-2xl">
                        <img 
                            src={preview || (existingImages.length > 0 ? (existingImages[0].startsWith('http') ? existingImages[0] : `${IMAGE_BASE_URL}${existingImages[0]}`) : 'https://via.placeholder.com/800')} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt="Preview" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        <label className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black uppercase italic text-xs hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">
                            <Upload size={18} /> {selectedImage ? "Change New Image" : "Upload New Image"}
                            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                    <div className="p-6 rounded-[2rem] border border-dashed border-zinc-800 flex items-center gap-4 text-zinc-500">
                        <Info size={20} className="text-red-600 shrink-0" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">การอัปโหลดรูปภาพใหม่จะเขียนทับรูปภาพเดิมของสินค้าชิ้นนี้ทันที โปรดตรวจสอบความถูกต้อง</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Product Name</label>
                            <div className="relative">
                                <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-red-600" size={20} />
                                <input 
                                    className="w-full bg-zinc-900 border border-zinc-800 p-5 pl-14 rounded-2xl outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Price (THB)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-red-600" size={20} />
                                    <input 
                                        type="number"
                                        className="w-full bg-zinc-900 border border-zinc-800 p-5 pl-14 rounded-2xl outline-none focus:border-red-600 transition-all font-bold"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Stock In Hand</label>
                                <div className="relative">
                                    <Database className="absolute left-5 top-1/2 -translate-y-1/2 text-red-600" size={20} />
                                    <input 
                                        type="number"
                                        className="w-full bg-zinc-900 border border-zinc-800 p-5 pl-14 rounded-2xl outline-none focus:border-red-600 transition-all font-bold"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Description</label>
                            <textarea 
                                className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-3xl outline-none focus:border-red-600 transition-all font-medium min-h-[150px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={updating}
                        className={`w-full py-6 rounded-3xl font-black text-xl italic transition-all flex items-center justify-center gap-4 shadow-2xl transform active:scale-95
                        ${updating ? 'bg-zinc-800 text-zinc-600 cursor-wait' : 'bg-red-600 text-white hover:bg-white hover:text-black shadow-red-600/20'}`}
                    >
                        {updating ? <><Loader2 className="animate-spin" /> UPDATING...</> : <><Save size={24}/> UPDATE SPECS</>}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default EditProduct;