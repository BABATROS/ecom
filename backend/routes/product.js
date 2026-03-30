const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');

// 1. การตั้งค่า Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } 
});

// Helper: ลบไฟล์ออกจาก Server
const deleteFile = (fileName) => {
  if (!fileName) return;
  const filePath = path.join(__dirname, '../../uploads/', fileName); 
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${fileName}`);
    } catch (e) {
      console.error("File delete error:", e.message);
    }
  }
};

// ---------------------------------------------------------
// [POST] เพิ่มสินค้าใหม่ (ฝังเจ้าของอัตโนมัติ)
// ---------------------------------------------------------
router.post('/', protect, sellerOrAdmin, upload.fields([
  { name: 'images', maxCount: 5 }, 
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, price, brand, description, category, sizes, condition } = req.body;

    // เตรียมข้อมูลสินค้า
    const productData = {
      name,
      price,
      brand,
      description,
      category,
      condition,
      // 🔥 หัวใจหลัก: ฝัง ID ของคนที่ Login อยู่ลงไปเป็นเจ้าของ
      owner: req.user.id 
    };

    // จัดการเรื่องไซส์ (ถ้าส่งมาเป็น JSON String จาก Frontend)
    if (sizes) {
      productData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    }

    // จัดการรูปภาพ
    if (req.files && req.files['images']) {
      productData.images = req.files['images'].map(f => f.filename);
    }

    // จัดการวิดีโอ
    if (req.files && req.files['video']) {
      productData.video = req.files['video'][0].filename;
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(400).json({ error: "เพิ่มสินค้าไม่สำเร็จ", message: err.message });
  }
});

// ---------------------------------------------------------
// [GET] ดึงเฉพาะสินค้าของ Owner (สำหรับหน้า Manage Inventory)
// ---------------------------------------------------------
router.get('/my-products', protect, sellerOrAdmin, async (req, res) => {
  try {
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    let query = {};

    // ถ้าไม่ใช่ admin ให้ดึงเฉพาะสินค้าที่ตัวเองเป็นเจ้าของ
    if (userRole !== 'admin') {
      query.owner = req.user.id; // ใช้ req.user.id จากการ Protect
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลสินค้าของคุณได้" });
  }
});

// ---------------------------------------------------------
// [GET ALL] ดึงสินค้าทั้งหมด (Public)
// ---------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { brand, search } = req.query;
    let query = {};
    if (brand) query.brand = brand;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "ดึงข้อมูลล้มเหลว" });
  }
});

// ---------------------------------------------------------
// [GET SINGLE] ดึงข้อมูลสินค้าชิ้นเดียว
// ---------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "ไม่พบสินค้า" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "ID สินค้าไม่ถูกต้อง" });
  }
});

// ---------------------------------------------------------
// [PUT] แก้ไขสินค้า
// ---------------------------------------------------------
router.put('/:id', protect, sellerOrAdmin, upload.fields([
  { name: 'images', maxCount: 5 }, 
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "ไม่พบสินค้า" });

    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const isAdmin = userRole === 'admin';
    const isOwner = product.owner && product.owner.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ msg: "คุณไม่มีสิทธิ์แก้ไขสินค้านี้" });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files['images']) {
      if (product.images) product.images.forEach(img => deleteFile(img)); 
      updateData.images = req.files['images'].map(f => f.filename);
    }

    if (req.files && req.files['video']) {
      if (product.video) deleteFile(product.video);
      updateData.video = req.files['video'][0].filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดต" });
  }
});

// ---------------------------------------------------------
// [DELETE] ลบสินค้า
// ---------------------------------------------------------
router.delete('/:id', protect, sellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "ไม่พบสินค้า" });

    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const isAdmin = userRole === 'admin';
    const isOwner = product.owner && product.owner.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ msg: "คุณไม่มีสิทธิ์ลบสินค้านี้" });
    }

    if (product.images) product.images.forEach(img => deleteFile(img));
    if (product.video) deleteFile(product.video);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "ลบสินค้าและไฟล์เรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ error: "ลบสินค้าไม่สำเร็จ" });
  }
});

module.exports = router;