const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // เพิ่มเพื่อใช้ตัดสต็อก
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');

// ✅ 1. [ADMIN/OWNER] ดึงออเดอร์ทั้งหมด (ปรับปรุงการกรองข้อมูล)
router.get('/all', protect, sellerOrAdmin, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      // Admin ดูได้ทั้งหมด
      orders = await Order.find()
        .populate('user', 'username email') 
        .sort({ createdAt: -1 });
    } else {
      // ShopOwner: ดูเฉพาะ Order ที่มีสินค้าของตัวเองอยู่ใน items
      // สมมติว่าใน Model Product มี field 'owner'
      orders = await Order.find({
        'items.product': { $in: await Product.find({ owner: req.user.id }).distinct('_id') }
      })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    }
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 2. [USER] สร้างออเดอร์ใหม่ (เพิ่มการตัดสต็อกสินค้า)
router.post('/', protect, async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, coupon } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "ไม่มีสินค้าในตะกร้า" });
    }

    // สร้าง Order
    const order = new Order({
      user: req.user.id,
      items, 
      total,
      shippingAddress,
      paymentMethod,
      coupon,
      status: paymentMethod === "Cash on Delivery" ? 'Pending' : 'Waiting for Payment'
    });

    const savedOrder = await order.save();

    // ⚡ ฟีเจอร์ตัดสต็อกสินค้าอัตโนมัติ
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity } // ลดจำนวนสต็อกตามที่สั่ง
      });
    }

    res.status(201).json({ success: true, data: savedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 3. [USER/ADMIN] ดึงข้อมูลออเดอร์รายตัว (เพิ่มใหม่ - สำคัญมาก)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');
    
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
    
    // ตรวจสอบสิทธิ์: ต้องเป็นเจ้าของออเดอร์ หรือเป็น Admin/Owner เท่านั้นถึงจะดูได้
    if (order.user._id.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 4. [USER] ดึงออเดอร์ของตัวเอง
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }); 
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 5. [USER] แจ้งชำระเงิน (ส่งสลิป)
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const { paymentSlip } = req.body; 
    
    if (!paymentSlip) {
      return res.status(400).json({ success: false, message: "กรุณาแนบรูปภาพสลิป" });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });

    order.paymentSlip = paymentSlip;
    order.status = 'Pending'; // เปลี่ยนเป็นรอตรวจสอบ
    order.isPaid = true;      // มาร์คว่าจ่ายแล้ว (รอตรวจ)
    order.paidAt = Date.now();
    
    await order.save();
    res.json({ success: true, message: "แจ้งชำระเงินสำเร็จ! ทีมงานกำลังตรวจสอบ", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 6. [ADMIN/OWNER] อัปเดตสถานะและเลขพัสดุ
router.put('/:id/status', protect, sellerOrAdmin, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body; 
    
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'Delivered') updateData.isDelivered = true;

    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
    res.json({ success: true, message: `อัปเดตสถานะเป็น ${status} เรียบร้อย`, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 7. [ADMIN] ลบออเดอร์
router.delete('/:id', protect, sellerOrAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "ลบออเดอร์ออกจากระบบแล้ว" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;