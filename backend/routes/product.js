const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

// 1. ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// 2. GET: ดึงสินค้าทั้งหมด
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌟 3. GET: ดึงข้อมูลสินค้าตาม ID (ตัวแก้บั๊ก Product Not Found)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "ไม่พบสินค้าชิ้นนี้ในระบบ" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "ID สินค้าไม่ถูกต้อง" });
  }
});

// 4. POST: เพิ่มสินค้าใหม่
router.post('/add', upload.fields([
  { name: 'images', maxCount: 5 }, 
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, brand, description, price, stock } = req.body;
    const imageFiles = req.files['images'] ? req.files['images'].map(f => f.filename) : [];
    const videoFile = req.files['video'] ? req.files['video'][0].filename : null;

    const newProduct = new Product({
      name, brand, description, price, stock,
      images: imageFiles,
      video: videoFile
    });

    await newProduct.save();
    res.status(201).json({ msg: 'เพิ่มสินค้าสำเร็จ!', product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE: ลบสินค้า
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ msg: "ไม่พบสินค้า" });
    res.json({ msg: "ลบสินค้าสำเร็จแล้ว" });
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
});

module.exports = router;