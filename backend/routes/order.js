const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// ✅ 1. สร้างออเดอร์ใหม่ (URL: POST /api/orders)
router.post('/', async (req, res) => {
  try {
    const { userId, user, items, total, shippingAddress, paymentMethod } = req.body;

    // รองรับทั้ง userId หรือ user เพื่อป้องกัน Error จาก Frontend
    const targetUser = userId || user;

    if (!targetUser || !items || items.length === 0 || !total) {
      return res.status(400).json({ 
        success: false, 
        message: "ข้อมูลไม่ครบถ้วน (กรุณาตรวจสอบสินค้าและราคารวม)" 
      });
    }

    const order = new Order({
      user: targetUser,
      items: items,
      total: total,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      // Logic การตั้งสถานะอัตโนมัติ
      status: paymentMethod === "Cash on Delivery" ? 'Pending' : 'Waiting for Payment'
    });
    
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error("Order Create Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 2. ดึงออเดอร์ของเฉพาะ User (สำคัญมากสำหรับหน้า My Orders)
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product') // ดึงรายละเอียดสินค้ามาแสดงรูปและชื่อ
      .sort({ createdAt: -1 }); 
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 3. แจ้งชำระเงิน/แนบสลิป (URL: PUT /api/orders/:id/pay)
router.put('/:id/pay', async (req, res) => {
  try {
    const { paymentSlip } = req.body; 
    
    if (!paymentSlip) {
      return res.status(400).json({ success: false, message: "กรุณาแนบไฟล์สลิปหลักฐานการโอน" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentSlip: paymentSlip,
        status: 'Paid' // อัปเดตสถานะเป็นชำระแล้ว เพื่อรอ Admin ตรวจสอบ
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลคำสั่งซื้อนี้" });
    }

    res.json({ success: true, message: "แจ้งชำระเงินสำเร็จ ระบบกำลังตรวจสอบ", data: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 4. ดึงออเดอร์ทั้งหมด (Admin Only)
// ย้ายเส้นทาง /all ไว้ข้างบนระบุ ID เสมอเพื่อป้องกัน Express สับสน
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email') 
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 5. (เพิ่มเติม) อัปเดตสถานะโดยแอดมิน (เช่น เปลี่ยนจาก Pending -> Shipped)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;