import React, { useState } from 'react';
import axios from 'axios';
import { PackagePlus, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

const AdminPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onSaveProduct = async (e) => {
    e.preventDefault();

    // 1. Validation เบื้องต้น
    if (!productName || !price || !selectedFile) {
      alert("กรุณากรอกข้อมูลให้ครบและเลือกรูปภาพครับ");
      return;
    }

    // 2. เตรียมข้อมูลด้วย FormData (ส่งไฟล์ + ข้อความในชุดเดียว)
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', price);
    formData.append('images', selectedFile); // ชื่อ 'images' ต้องตรงกับที่ Backend (Multer) กำหนด

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');

      // 3. ยิง API ชุดเดียวจบ (Backend จะอัปโหลดรูปและ Save ลง DB ให้เอง)
      const res = await axios.post('https://ecom-ghqt.onrender.com/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 201 || res.status === 200) {
        alert("🔥 บันทึกสินค้า SneakerHub เรียบร้อย!");
        // ล้างฟอร์ม
        setProductName('');
        setPrice('');
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Save Product Error:", err);
      alert(err.response?.data?.msg || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">
      <form onSubmit={onSaveProduct} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
          <PackagePlus className="text-red-600" />
          Add New Sneaker
        </h2>

        <div className="space-y-5">
          {/* Input ชื่อสินค้า */}
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Sneaker Model</label>
            <input 
              type="text" 
              placeholder="เช่น Jordan 1 High"
              className="w-full bg-black p-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          {/* Input ราคา */}
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Price (THB)</label>
            <input 
              type="number" 
              placeholder="5900"
              className="w-full bg-black p-4 rounded-2xl border border-zinc-800 focus:border-red-600 outline-none transition-all"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Input อัปโหลดรูป */}
          <div className="pt-2">
            <label className="group flex flex-col items-center justify-center w-full h-40 bg-black border-2 border-dashed border-zinc-800 rounded-[2rem] cursor-pointer hover:border-red-600 transition-all overflow-hidden relative">
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="text-green-500 mb-2" size={32} />
                  <span className="text-[10px] font-bold text-zinc-400">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="text-zinc-600 group-hover:text-red-600 transition-colors mb-2" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Choose Media</span>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
              />
            </label>
          </div>

          {/* ปุ่มบันทึก */}
          <button 
            type="submit"
            disabled={isUploading}
            className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              "Confirm & Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPage;