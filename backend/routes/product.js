const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

// ตั้งค่า Upload (OWASP: เพิ่มจำกัดขนาดไฟล์สักหน่อยเพื่อป้องกันคนอัปโหลดไฟล์ยักษ์จนเซิร์ฟเวอร์ค้าง)
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==========================================
// 🛍️ โซนสำหรับลูกค้า (Public - ไม่ต้อง Login)
// ==========================================

// 1. ดึงสินค้าทั้งหมด (สำหรับหน้าแรก / หน้าร้านค้า)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('owner', 'username').sort({ createdAt: -1 });
        res.json({ success: true, count: products.length, products });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. ดึงสินค้าชิ้นเดียว (สำหรับหน้ารายละเอียดสินค้า) - ⚠️ ต้องอยู่ใต้ /my-products เสมอ
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('owner', 'username');
        if (!product) return res.status(404).json({ msg: 'ไม่พบสินค้านี้' });
        res.json({ success: true, product });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 🛡️ โซนสำหรับเจ้าของร้าน และ Admin (Protected)
// ==========================================

// 3. ดึงข้อมูลสินค้า (เฉพาะของตัวเอง หรือ ทั้งหมดถ้าเป็น Admin)
router.get('/shop/my-products', protect, sellerOrAdmin, async (req, res) => {
    try {
        // แอดมินดูได้หมด, ร้านค้าดูได้แค่ของตัวเอง
        const query = (req.user.role === 'admin') ? {} : { owner: req.user.id };
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. เพิ่มสินค้าใหม่
router.post('/', protect, sellerOrAdmin, upload.fields([{ name: 'images' }]), async (req, res) => {
    try {
        let productData = { ...req.body, owner: req.user.id };
        
        // 💡 ทริค: เวลาส่ง FormData จาก React ตัว array/object มักจะกลายเป็น String ต้องแปลงกลับ
        if (typeof req.body.sizes === 'string') {
            try { productData.sizes = JSON.parse(req.body.sizes); } catch(e) {}
        }

        if (req.files?.images) {
            // เซฟ URL รูปภาพให้ตรงกับที่ตั้งไว้ใน server.js (app.use('/uploads', ...))
            productData.images = req.files.images.map(f => `/uploads/${f.filename}`);
        }
        
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 5. แก้ไขสินค้า (ต้องเป็นเจ้าของ หรือ Admin เท่านั้น)
router.put('/:id', protect, sellerOrAdmin, upload.fields([{ name: 'images' }]), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'ไม่พบสินค้าในระบบ' });

        if (product.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'คุณไม่มีสิทธิ์แก้ไขสินค้านี้' });
        }

        let updateData = { ...req.body };
        
        // แปลง sizes กลับเป็น Array ถ้าส่งมาเป็น String
        if (typeof req.body.sizes === 'string') {
            try { updateData.sizes = JSON.parse(req.body.sizes); } catch(e) {}
        }

        // ถ้ามีการอัปโหลดรูปใหม่ ให้เอาไปต่อท้ายรูปเดิม (หรือจะเขียนทับก็ได้ตามชอบ)
        if (req.files?.images) {
            const newImages = req.files.images.map(f => `/uploads/${f.filename}`);
            updateData.images = [...product.images, ...newImages];
        }

        product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.json({ success: true, msg: 'อัปเดตสินค้าเรียบร้อย', product });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// 6. ลบสินค้า (ต้องเป็นเจ้าของ หรือ Admin เท่านั้น)
router.delete('/:id', protect, sellerOrAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ msg: 'ไม่พบสินค้าในระบบ' });
        }

        // ตรวจสอบสิทธิ์: ถ้าไม่ใช่ Admin และไม่ใช่เจ้าของสินค้า จะลบไม่ได้
        if (product.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'คุณไม่มีสิทธิ์ลบสินค้านี้' });
        }

        await product.deleteOne(); 
        res.json({ success: true, msg: 'ลบสินค้าเรียบร้อย' });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;