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

// ==========================================
// 🛍️ โซนสำหรับลูกค้า (Public)
// ==========================================

// 🌟 [PUBLIC] ดึงคูปองทั้งหมดที่ยัง Active และไม่หมดอายุ (สำหรับแสดงให้ลูกค้ากดรับ)
router.get('/public', async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      active: true, 
      expiryDate: { $gt: new Date() }, // ดึงเฉพาะที่ยังไม่หมดอายุ
      $expr: { 
        // ดึงเฉพาะที่จำนวนการใช้ยังไม่เต็ม (หรือไม่มีจำกัด)
        $or: [
          { $eq: ["$usageLimit", null] },
          { $lt: ["$usedCount", "$usageLimit"] }
        ]
      }
    }).select('-createdBy -usedCount'); // ซ่อนข้อมูลบางอย่างไม่ให้ลูกค้าเห็น

    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌟 [USER] ตรวจสอบคูปอง (สำหรับหน้า Checkout)
router.post('/verify', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ msg: 'กรุณาระบุรหัสคูปอง' });

    // ค้นหาคูปอง
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ msg: 'ไม่พบรหัสคูปองนี้' });
    }

    // 💡 เรียกใช้ Custom Method isValid ที่เราสร้างไว้ใน Model
    const validation = coupon.isValid(cartTotal);
    
    if (!validation.valid) {
      return res.status(400).json({ msg: validation.msg });
    }

    res.json({
      success: true,
      msg: 'ใช้งานคูปองสำเร็จ',
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minCartTotal: coupon.minCartTotal
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🛡️ โซนสำหรับ Admin และ Owner (Protected)
// ==========================================

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
    res.status(201).json({ success: true, msg: 'สร้างคูปองสำเร็จ', coupon });
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

    await coupon.deleteOne(); // ใช้ deleteOne แทน findByIdAndDelete เพื่อให้สอดคล้องกับโค้ดส่วนอื่น
    res.json({ success: true, msg: "ลบคูปองสำเร็จแล้ว" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;