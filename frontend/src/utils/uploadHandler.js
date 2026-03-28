import axios from 'axios';

export const handleUpload = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file); 

  try {
    const res = await axios.post('http://localhost:5000/api/upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return res.data.path; // ส่ง Path ที่ได้จาก Backend กลับไปบันทึกใน Database ต่อ
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed: ไฟล์อาจมีขนาดใหญ่เกินไปหรือชนิดไฟล์ไม่ถูกต้อง");
    return null;
  }
};