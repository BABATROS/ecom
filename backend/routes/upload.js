const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

// 1. ตั้งค่าการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์: timestamp-สุ่มตัวเลข.นามสกุลเดิม
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// 2. ตัวกรองประเภทไฟล์ (Security Check)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp) เท่านั้น!'));
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // จำกัดขนาด 5MB
});

// 3. Route สำหรับอัปโหลด (ตัวอย่าง: อัปโหลดสลิป หรือรูปโปรไฟล์)
router.post('/', protect, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // กรณี Error จาก Multer เช่น ไฟล์ใหญ่เกินไป
      return res.status(400).json({ success: false, msg: `Multer Error: ${err.message}` });
    } else if (err) {
      // กรณี Error อื่นๆ เช่น ประเภทไฟล์ไม่ถูกต้อง
      return res.status(400).json({ success: false, msg: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, msg: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' });
    }

    // ตอบกลับ Path ของไฟล์ เพื่อให้ Frontend นำไปใช้ต่อ (เช่น แสดงตัวอย่างรูป)
    res.json({ 
      success: true, 
      message: 'อัปโหลดสำเร็จ', 
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}` 
    });
  });
});

module.exports = router;