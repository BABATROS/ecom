const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

// ตั้งค่า Upload แบบง่ายที่สุด
const upload = multer({ dest: 'uploads/' });

router.post('/', protect, sellerOrAdmin, upload.fields([{ name: 'images' }]), async (req, res) => {
    try {
        const productData = { ...req.body, owner: req.user.id };
        if (req.files?.images) productData.images = req.files.images.map(f => f.filename);
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/my-products', protect, sellerOrAdmin, async (req, res) => {
    try {
        const query = (req.user.role === 'admin') ? {} : { owner: req.user.id };
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;