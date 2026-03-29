import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, ImagePlus, Video, CheckCircle, PackageSearch } from 'lucide-react';

const AddProductModal = ({ onClose }) => {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [selectedImages, setSelectedImages] = useState([]); 
    const [imagePreviews, setImagePreviews] = useState([]); 
    const [selectedVideo, setSelectedVideo] = useState(null);

    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

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

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedVideo(file);
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
        formData.append('price', price);
        selectedImages.forEach((img) => formData.append('images', img));
        if (selectedVideo) formData.append('video', selectedVideo);

        try {
            const res = await axios.post('https://ecom-ghqt.onrender.com/api/orders', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`✅ ${res.data.msg || 'เพิ่มสินค้าสำเร็จ'}`);
            onClose(); // สั่งปิด Modal เมื่อสำเร็จ
        } catch (error) {
            console.error(error);
            alert('❌ เกิดข้อผิดพลาดในการเพิ่มสินค้า');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[100] backdrop-blur-sm">
            <div className="bg-zinc-950 p-8 rounded-3xl text-white border border-zinc-800 shadow-2xl w-full max-w-lg">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <PackageSearch size={22} className="text-red-500"/>
                        <span>Add New Sneaker</span>
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={productName} placeholder="ชื่อสินค้า" required 
                        className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-red-600 outline-none" 
                        onChange={(e) => setProductName(e.target.value)} />
                    
                    <input type="number" value={price} placeholder="ราคา (฿)" required 
                        className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-red-600 outline-none" 
                        onChange={(e) => setPrice(e.target.value)} />

                    <div className="grid grid-cols-4 gap-2 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                        {imagePreviews.map((url, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={url} className="w-full h-full object-cover rounded-lg" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5"><X size={12}/></button>
                            </div>
                        ))}
                        {imagePreviews.length < 5 && (
                            <label className="aspect-square bg-zinc-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700 border border-zinc-700">
                                <ImagePlus size={20} className="text-zinc-500" />
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-red-600 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                        CONFIRM ADD PRODUCT
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;