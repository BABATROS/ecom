const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// ฟังก์ชันสำหรับสร้างคูปองเริ่มต้น (Helper Function)
const createDefaultCoupons = async () => {
  const defaultCoupons = [
    { code: 'WELCOME10', discountType: 'percent', discountValue: 10, minCartTotal: 0, active: true },
    { code: 'SAVE100', discountType: 'amount', discountValue: 100, minCartTotal: 1000, active: true },
    { code: 'FREESHIP', discountType: 'free_shipping', discountValue: 0, minCartTotal: 1500, active: true }
  ];
  await Coupon.insertMany(defaultCoupons);
};

// 1. GET: ดึงคูปองทั้งหมด (สำหรับ Admin) + สร้างค่าเริ่มต้นหากไม่มีข้อมูล
router.get('/', async (req, res) => {
  try {
    let coupons = await Coupon.find().sort({ createdAt: -1 });

    // ถ้าไม่มีคูปองเลย ให้สร้างชุดเริ่มต้นทันที
    if (coupons.length === 0) {
      await createDefaultCoupons();
      coupons = await Coupon.find().sort({ createdAt: -1 });
    }

    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET: ดึงคูปองที่ใช้งานได้เท่านั้น (สำหรับหน้าบ้าน)
router.get('/available', async (req, res) => {
  try {
    const coupons = await Coupon.find({ active: true });
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
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: req.body.code?.trim().toUpperCase() },
      { new: true }
    );
    if (!updatedCoupon) return res.status(404).json({ msg: "ไม่พบคูปอง" });
    res.json(updatedCoupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE: ลบคูปอง
router.delete('/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ msg: "ลบคูปองสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;