const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// ดึงคูปองที่เปิดใช้งานได้
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

// สร้างคูปองใหม่ (สำหรับ Owner)
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

module.exports = router;
