const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');

// 1. ตั้งค่า Cloudinary (เอาค่าพวกนี้มาจากหน้า Dashboard ของ Cloudinary)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. ตั้งค่า Multer ให้เซฟลง Cloudinary แทน Disk
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sneaker-vault-uploads', // ชื่อโฟลเดอร์ใน Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    // สามารถลดขนาดรูปอัตโนมัติได้ด้วย
    transformation: [{ width: 800, height: 800, crop: 'limit' }] 
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // จำกัดขนาด 5MB
});

// 3. Route สำหรับอัปโหลด
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, msg: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' });
    }

    // Cloudinary จะคืนค่า req.file.path ซึ่งเป็น URL รูปภาพมาให้เลย
    res.json({ 
      success: true, 
      message: 'อัปโหลดสำเร็จ', 
      filename: req.file.filename,
      path: req.file.path // 🌟 URL ของรูปภาพบน Cloudinary (เอาไปเซฟลง Database ได้เลย)
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'เกิดข้อผิดพลาดในการอัปโหลด' });
  }
});

module.exports = router;