const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly, sellerOrAdmin } = require('../middleware/authMiddleware');

// 🛠️ Helper Function: สร้างคูปองเริ่มต้น (ถ้าไม่มีข้อมูลเลย)
const createDefaultCoupons = async (adminId) => {
  const defaultCoupons = [
    { 
      code: 'WELCOME10', discountType: 'percent', discountValue: 10, 
      minCartTotal: 0, expiryDate: new Date('2030-12-31'), createdBy: adminId 
    },
    { 
      code: 'SAVE100', discountType: 'amount', discountValue: 100, 
      minCartTotal: 1000, expiryDate: new Date('2030-12-31'), createdBy: adminId 
    }
  ];
  await Coupon.insertMany(defaultCoupons);
};

// 🌟 [ADMIN/OWNER] ดึงคูปองทั้งหมด
router.get('/', protect, sellerOrAdmin, async (req, res) => {
  try {
    let query = {};
    // ถ้าไม่ใช่ Admin ให้ดูได้เฉพาะคูปองที่ตัวเองสร้าง
    if (req.user.role !== 'admin') {
      query.createdBy = req.user.id;
    }

    let coupons = await Coupon.find(query).sort({ createdAt: -1 });

    // สร้าง Default เฉพาะกรณีที่เป็น Admin และยังไม่มีคูปอง
    if (coupons.length === 0 && req.user.role === 'admin') {
      await createDefaultCoupons(req.user.id);
      coupons = await Coupon.find().sort({ createdAt: -1 });
    }

    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌟 [PUBLIC/USER] ตรวจสอบคูปอง (สำหรับหน้า Checkout)
router.post('/verify', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ msg: 'กรุณาระบุรหัสคูปอง' });

    // ค้นหาคูปอง (ใช้ .trim().toUpperCase() เพื่อป้องกันการพิมพ์เล็ก/เว้นวรรค)
    const coupon = await Coupon.findOne({ 
      code: code.trim().toUpperCase(), 
      active: true 
    });
    
    if (!coupon) {
      return res.status(404).json({ msg: 'ไม่พบรหัสคูปองนี้ หรือคูปองหมดอายุแล้ว' });
    }

    // ตรวจสอบวันหมดอายุ (Expiry Date)
    if (new Date(coupon.expiryDate) < new Date()) {
       return res.status(400).json({ msg: 'คูปองนี้หมดอายุแล้ว' });
    }

    // ตรวจสอบยอดขั้นต่ำ (ถ้า cartTotal ที่ส่งมาน้อยกว่าเงื่อนไข)
    if (cartTotal < coupon.minCartTotal) {
      return res.status(400).json({ 
        msg: `ยอดซื้อขั้นต่ำต้องถึง ฿${coupon.minCartTotal} (ปัจจุบันขาดอีก ฿${coupon.minCartTotal - cartTotal})` 
      });
    }

    res.json({
      success: true,
      msg: 'ใช้งานคูปองสำเร็จ',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌟 [ADMIN/OWNER] เพิ่มคูปองใหม่
router.post('/add', protect, sellerOrAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartTotal, expiryDate, usageLimit } = req.body;
    const normalizedCode = code.trim().toUpperCase();
    
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) return res.status(400).json({ msg: 'รหัสคูปองนี้มีอยู่ในระบบแล้ว' });

    const coupon = new Coupon({
      code: normalizedCode,
      discountType,
      discountValue: Number(discountValue),
      minCartTotal: Number(minCartTotal) || 0,
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 วัน
      usageLimit: usageLimit ? Number(usageLimit) : null,
      createdBy: req.user.id
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌟 [ADMIN/OWNER] ลบคูปอง
router.delete('/:id', protect, sellerOrAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ msg: "ไม่พบคูปอง" });

    // ป้องกันการลบคูปองของคนอื่น (ยกเว้น Admin)
    if (coupon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "คุณไม่มีสิทธิ์จัดการคูปองนี้" });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ msg: "ลบคูปองสำเร็จแล้ว" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;