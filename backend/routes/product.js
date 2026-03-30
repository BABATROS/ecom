const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ตั้งค่า multer เก็บไฟล์ใน uploads และตั้งชื่อไฟล์ให้ไม่ชนกัน
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp)'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// GET /api/products  — ดึงสินค้าทั้งหมด
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/my-products  — ดึงสินค้าของผู้ขายหรือ admin
router.get('/my-products', protect, sellerOrAdmin, async (req, res) => {
  try {
    const query = (req.user.role === 'admin') ? {} : { owner: req.user.id };
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products  — สร้างสินค้าใหม่ พร้อมอัปโหลดรูปภาพ (ฟิลด์ชื่อ images)
router.post('/', protect, sellerOrAdmin, upload.array('images', 8), async (req, res) => {
  try {
    // ตรวจสอบข้อมูลพื้นฐาน
    const { name, price, category, description, sizes } = req.body;
    if (!name || !price) {
      return res.status(400).json({ msg: 'กรุณาระบุชื่อสินค้าและราคา' });
    }

    const productData = {
      name,
      price: Number(price),
      category: category || 'Sneaker',
      description: description || '',
      owner: req.user.id
    };

    // ถ้าส่ง sizes มาเป็น JSON string ให้ parse
    if (sizes) {
      try {
        productData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        return res.status(400).json({ msg: 'รูปแบบ sizes ไม่ถูกต้อง (ต้องเป็น JSON)' });
      }
    }

    // เก็บชื่อไฟล์รูปภาพถ้ามี
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(f => f.filename);
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    // ถ้า multer error จะเข้ามาที่นี่เป็น Error object
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
