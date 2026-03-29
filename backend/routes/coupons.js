const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// 1. GET: ดึงคูปองที่เปิดใช้งานได้ (สำหรับหน้าบ้าน/ลูกค้า)
router.get('/available', async (req, res) => {
  try {
    let coupons = await Coupon.find({ active: true });

    if (!coupons.length) {
      const defaultCoupons = [
        { code: 'WELCOME10', discountType: 'percent', discountValue: 10, minCartTotal: 0, active: true },
        { code: 'SAVE100', discountType: 'amount', discountValue: 100, minCartTotal: 1000, active: true },
        { code: 'FREESHIP', discountType: 'free_shipping', discountValue: 0, minCartTotal: 1500, active: true }
      ];
      await Coupon.insertMany(defaultCoupons);
      coupons = await Coupon.find({ active: true });
    }

    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET: ดึงคูปองทั้งหมด (สำหรับ Admin ดูในตารางจัดการ)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST: สร้างคูปองใหม่
router.post('/add', async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartTotal } = req.body;
    if (!code || !discountType) return res.status(400).json({ msg: 'กรุณาระบุรหัสคูปองและประเภทส่วนลด' });

    const normalizedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) return res.status(400).json({ msg: 'คูปองนี้มีอยู่แล้ว' });

    const coupon = new Coupon({
      code: normalizedCode,
      discountType,
      discountValue: Number(discountValue) || 0,
      minCartTotal: Number(minCartTotal) || 0,
      active: true
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. PUT: แก้ไขคูปอง
router.put('/:id', async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartTotal, active } = req.body;
    
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { 
        code: code ? code.trim().toUpperCase() : undefined, 
        discountType, 
        discountValue, 
        minCartTotal, 
        active 
      },
      { new: true }
    );

    if (!updatedCoupon) return res.status(404).json({ msg: "ไม่พบคูปองที่ต้องการแก้ไข" });
    res.json({ msg: "อัปเดตคูปองสำเร็จ", coupon: updatedCoupon });
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขคูปอง" });
  }
});

// 5. DELETE: ลบคูปอง
router.delete('/:id', async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) return res.status(404).json({ msg: "ไม่พบคูปอง" });
    res.json({ msg: "ลบคูปองออกจากระบบแล้ว" });
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบ" });
  }
});

module.exports = router;