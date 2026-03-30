import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, ImagePlus, Video, CheckCircle, PackageSearch, Film } from 'lucide-react';

const AddProductModal = ({ onClose, onRefresh }) => {
    const [productName, setProductName] = useState('');
    const [brand, setBrand] = useState(''); // เพิ่มแบรนด์
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('1'); // เพิ่มสต็อก
    const [description, setDescription] = useState(''); // เพิ่มรายละเอียด
    const [selectedImages, setSelectedImages] = useState([]); 
    const [imagePreviews, setImagePreviews] = useState([]); 
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 5) {
            alert("เลือกรูปได้สูงสุด 5 รูปครับ");
            return;
        }
        setSelectedImages((prev) => [...prev, ...files]);
        
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file); 
        });
    };

    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!productName || !price || selectedImages.length === 0) {
            alert('กรุณากรอกข้อมูลและเลือกรูปภาพ!');
            return;
        }

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('brand', brand);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        
        selectedImages.forEach((img) => formData.append('images', img));
        if (selectedVideo) formData.append('video', selectedVideo);

        try {
            const token = localStorage.getItem('token');
            // เปลี่ยน URL เป็น /api/products
            const res = await axios.post('https://ecom-ghqt.onrender.com/api/products', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // ต้องส่ง Token ไปด้วย
                }
            });
            
            alert(`✅ ${res.data.msg || 'เพิ่มสินค้าลงคลังสำเร็จ'}`);
            if (onRefresh) onRefresh(); // ถ้ามีฟังก์ชันรีเฟรชหน้าจอให้เรียกใช้
            onClose(); 
        } catch (error) {
            console.error(error);
            alert(`❌ ${error.response?.data?.msg || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า'}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
            <div className="bg-zinc-950 p-6 md:p-8 rounded-[2rem] text-white border border-zinc-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-600/20 p-2 rounded-xl">
                            <PackageSearch size={24} className="text-red-600"/>
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">New Listing</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all hover:rotate-90">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ฝั่งข้อมูลตัวอักษร */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Product Name</label>
                            <input type="text" value={productName} placeholder="เช่น Jordan 1 High OG" required 
                                className="w-full bg-zinc-900 p-3 rounded-xl border border-zinc-800 focus:border-red-600 outline-none transition-all" 
                                onChange={(e) => setProductName(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Brand</label>
                                <input type="text" value={brand} placeholder="Nike, Adidas"
                                    className="w-full bg-zinc-900 p-3 rounded-xl border border-zinc-800 focus:border-red-600 outline-none" 
                                    onChange={(e) => setBrand(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Price (฿)</label>
                                <input type="number" value={price} placeholder="0.00" required 
                                    className="w-full bg-zinc-900 p-3 rounded-xl border border-zinc-800 focus:border-red-600 outline-none" 
                                    onChange={(e) => setPrice(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Description</label>
                            <textarea value={description} rows="3" placeholder="รายละเอียดสินค้า..."
                                className="w-full bg-zinc-900 p-3 rounded-xl border border-zinc-800 focus:border-red-600 outline-none resize-none"
                                onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                    </div>

                    {/* ฝั่งอัปโหลดไฟล์ */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Media Assets (Max 5)</label>
                        <div className="grid grid-cols-3 gap-2 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800 border-dashed">
                            {imagePreviews.map((url, index) => (
                                <div key={index} className="relative aspect-square group">
                                    <img src={url} className="w-full h-full object-cover rounded-xl border border-zinc-700" />
                                    <button type="button" onClick={() => removeImage(index)} 
                                        className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={10} strokeWidth={4}/>
                                    </button>
                                </div>
                            ))}
                            {imagePreviews.length < 5 && (
                                <label className="aspect-square bg-zinc-900 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800 border border-zinc-800 transition-all group">
                                    <ImagePlus size={24} className="text-zinc-600 group-hover:text-red-600 transition-colors" />
                                    <span className="text-[8px] mt-1 font-bold text-zinc-500">ADD IMAGE</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>

                        <div className="relative group">
                            <label className={`w-full flex items-center justify-between p-3 rounded-xl border border-zinc-800 cursor-pointer transition-all ${selectedVideo ? 'bg-green-600/10 border-green-600/50' : 'bg-zinc-900 hover:bg-zinc-800'}`}>
                                <div className="flex items-center gap-3">
                                    <Film size={20} className={selectedVideo ? 'text-green-500' : 'text-zinc-500'} />
                                    <span className="text-xs font-bold truncate max-w-[150px]">
                                        {selectedVideo ? selectedVideo.name : 'UPLOAD CINEMATIC VIDEO'}
                                    </span>
                                </div>
                                {selectedVideo && <CheckCircle size={16} className="text-green-500" />}
                                <input type="file" accept="video/*" className="hidden" 
                                    onChange={(e) => setSelectedVideo(e.target.files[0])} />
                            </label>
                            {selectedVideo && (
                                <button type="button" onClick={() => setSelectedVideo(null)} className="absolute -top-2 -right-2 bg-zinc-800 rounded-full p-1 text-zinc-400 hover:text-white">
                                    <X size={10}/>
                                </button>
                            )}
                        </div>

                        <button type="submit" className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all shadow-xl shadow-red-600/20 active:scale-95">
                            Publish to Warehouse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;