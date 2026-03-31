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

// ✅ ประกาศ upload แค่ครั้งเดียว
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==========================================
// 🛍️ โซนสำหรับลูกค้า (Public)
// ==========================================

// 1. ดึงสินค้าทั้งหมด (หน้าแรก)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('owner', 'username').sort({ createdAt: -1 });
    // 🟢 เสริมโครงสร้างข้อมูลให้ Frontend อ่านง่ายๆ
    res.json({ success: true, count: products.length, products: products, data: products });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 🛡️ โซนสำหรับเจ้าของร้าน และ Admin (Protected)
// ==========================================

// 2. ดึงสินค้าของตัวเอง (หรือทั้งหมดถ้าเป็น Admin) 
// 🚨 ต้องย้ายมาไว้ข้างบน /:id ไม่งั้นพัง!
router.get('/shop/my-products', protect, sellerOrAdmin, async (req, res) => {
  try {
    const query = (req.user.role === 'admin') ? {} : { owner: req.user.id };
    const products = await Product.find(query).sort({ createdAt: -1 });
    // 🟢 เสริมโครงสร้างข้อมูลให้หน้า Admin อ่านออก
    res.json({ success: true, products: products, data: products });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. เพิ่มสินค้าใหม่
router.post('/', protect, sellerOrAdmin, upload.fields([{ name: 'images' }]), async (req, res) => {
  try {
    let productData = { ...req.body, owner: req.user.id };

    if (typeof req.body.sizes === 'string') {
      try { productData.sizes = JSON.parse(req.body.sizes); } catch(e) {}
    }

    if (req.files?.images) {
      productData.images = req.files.images.map(f => `/uploads/${f.filename}`);
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 4. แก้ไขสินค้า
router.put('/:id', protect, sellerOrAdmin, upload.fields([{ name: 'images' }]), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'ไม่พบสินค้าในระบบ' });

    if (product.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'คุณไม่มีสิทธิ์แก้ไขสินค้านี้' });
    }

    let updateData = { ...req.body };

    if (typeof req.body.sizes === 'string') {
      try { updateData.sizes = JSON.parse(req.body.sizes); } catch(e) {}
    }

    if (req.files?.images) {
      const newImages = req.files.images.map(f => `/uploads/${f.filename}`);
      updateData.images = [...product.images, ...newImages];
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, msg: 'อัปเดตสินค้าเรียบร้อย', product });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 5. ลบสินค้า
router.delete('/:id', protect, sellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'ไม่พบสินค้าในระบบ' });

    if (product.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'คุณไม่มีสิทธิ์ลบสินค้านี้' });
    }

    await product.deleteOne();
    res.json({ success: true, msg: 'ลบสินค้าเรียบร้อย' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ⚠️ โซนจับ ID (ต้องไว้ล่างสุดเสมอ!)
// ==========================================

// 6. ดึงสินค้าชิ้นเดียว
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('owner', 'username');
    if (!product) return res.status(404).json({ msg: 'ไม่พบสินค้านี้' });
    // 🟢 เสริมโครงสร้างให้หน้า ProductDetail.jsx อ่านง่าย
    res.json({ success: true, product: product, data: product });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;