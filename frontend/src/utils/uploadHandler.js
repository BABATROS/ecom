import axios from 'axios';

export const handleUpload = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file); 

  try {
    const res = await axios.post('https://ecom-ghqt.onrender.com/api/upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return res.data.path; // ส่ง Path ที่ได้จาก Backend กลับไปบันทึกใน Database ต่อ
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    
    if (err.response?.status === 413) {
      alert("ไฟล์มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 5MB)");
    } else {
      alert("การอัปโหลดล้มเหลว: โปรดตรวจสอบชนิดไฟล์หรือสิทธิ์การเข้าถึง");
    }
    return null;
  }
};