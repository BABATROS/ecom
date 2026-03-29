const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// ✅ 1. GET: ดึงออเดอร์ทั้งหมด (สำหรับ Admin ดูสถานะชำระเงิน)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email') 
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 2. POST: สร้างออเดอร์ใหม่
router.post('/', async (req, res) => {
  try {
    const { user, items, total, address, paymentMethod } = req.body;

    if (!user || !items || items.length === 0 || !total) {
      return res.status(400).json({ 
        success: false, 
        message: "ข้อมูลไม่ครบถ้วน" 
      });
    }

    const order = new Order({
      user,
      items,
      total,
      shippingAddress: address,
      paymentMethod,
      // ปรับ Logic: ถ้าโอนเงินให้รอตรวจสอบ (Pending Verification)
      status: paymentMethod === "Cash on Delivery" ? 'Pending' : 'Waiting for Payment'
    });
    
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 3. GET: ดึงออเดอร์ของเฉพาะ User
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product') 
      .sort({ createdAt: -1 }); 
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 4. PUT: แจ้งชำระเงิน (User ส่งสลิป)
router.put('/:id/pay', async (req, res) => {
  try {
    const { paymentSlip } = req.body; 
    
    if (!paymentSlip) {
      return res.status(400).json({ success: false, message: "กรุณาแนบสลิป" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentSlip: paymentSlip,
        status: 'Pending Verification' // เปลี่ยนจาก Paid เป็น รอตรวจสอบสลิปก่อน
      },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
    res.json({ success: true, message: "ส่งหลักฐานสำเร็จ! รอร้านตรวจสอบ", data: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 5. PUT: อัปเดตสถานะ (สำหรับ Admin ยืนยันว่า Paid หรือส่งของแล้ว)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // เช่น 'Paid', 'Shipped', 'Cancelled'
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
    res.json({ success: true, message: "อัปเดตสถานะสำเร็จ", data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🌟 6. DELETE: ลบออเดอร์ (เพิ่มส่วนนี้สำหรับ Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์ที่ต้องการลบ" });
    res.json({ success: true, message: "ลบออเดอร์เรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;