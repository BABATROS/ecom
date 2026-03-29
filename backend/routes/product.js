const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product'); // อ้างอิง Model เดิมของคุณ

// 1. ตั้งค่าการเก็บไฟล์ (Multer Storage)
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// 2. GET: ดึงสินค้าทั้งหมด
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST: เพิ่มสินค้าใหม่ (รองรับหลายรูปภาพ + 1 วิดีโอ)
// @route   POST /api/products/add
router.post('/add', upload.fields([
  { name: 'images', maxCount: 5 }, 
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, brand, description, price, stock } = req.body;
    
    // จัดการชื่อไฟล์จาก Multer
    const imageFiles = req.files['images'] ? req.files['images'].map(f => f.filename) : [];
    const videoFile = req.files['video'] ? req.files['video'][0].filename : null;

    const newProduct = new Product({
      name,
      brand,
      description,
      price,
      stock,
      images: imageFiles,
      video: videoFile
    });

    await newProduct.save();
    res.status(201).json({ msg: 'เพิ่มสินค้าสำเร็จ!', product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE: ลบสินค้าตาม ID
// @route   DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // ค้นหาและลบข้อมูลจาก MongoDB
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ msg: "ไม่พบสินค้าชิ้นนี้ในระบบ" });
    }

    res.json({ msg: "ลบสินค้าสำเร็จแล้ว", id: id });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบสินค้า" });
  }
});

module.exports = router;