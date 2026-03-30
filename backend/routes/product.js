const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

// ตั้งค่า Upload แบบง่ายที่สุด
const upload = multer({ dest: 'uploads/' });

// 1. เพิ่มสินค้าใหม่
router.post('/', protect, sellerOrAdmin, upload.fields([{ name: 'images' }]), async (req, res) => {
    try {
        const productData = { ...req.body, owner: req.user.id };
        if (req.files?.images) productData.images = req.files.images.map(f => f.filename);
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 2. ดึงข้อมูลสินค้า (เฉพาะของตัวเอง หรือ ทั้งหมดถ้าเป็น Admin)
router.get('/my-products', protect, sellerOrAdmin, async (req, res) => {
    try {
        const query = (req.user.role === 'admin') ? {} : { owner: req.user.id };
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. ลบสินค้า (ต้องเป็นเจ้าของ หรือ Admin เท่านั้น)
router.delete('/:id', protect, sellerOrAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ msg: 'ไม่พบสินค้าในระบบ' });
        }

        // ตรวจสอบสิทธิ์: ถ้าไม่ใช่ Admin และไม่ใช่เจ้าของสินค้า จะลบไม่ได้
        if (product.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'คุณไม่มีสิทธิ์ลบสินค้านี้' });
        }

        await product.deleteOne(); // หรือ await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'ลบสินค้าเรียบร้อย' });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;