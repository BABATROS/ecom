const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// ---------------------------------------------------------
// 💡 ข้อควรระวัง: วาง Route ที่เป็น "คำเฉพาะ" (เช่น /all) 
// ไว้ก่อน Route ที่เป็น "Parameter" (เช่น /:id) เสมอ
// ---------------------------------------------------------

// ✅ 1. ดึงออเดอร์ทั้งหมด (สำหรับ Admin)
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

// ✅ 2. สร้างออเดอร์ใหม่ (URL: POST /api/orders)
router.post('/', async (req, res) => {
  try {
    const { user, items, total, address, paymentMethod } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!user || !items || items.length === 0 || !total) {
      return res.status(400).json({ 
        success: false, 
        message: "ข้อมูลไม่ครบถ้วน (ขาดข้อมูลผู้ใช้, สินค้า หรือราคารวม)" 
      });
    }

    const order = new Order({
      user: user,
      items: items,
      total: total,
      shippingAddress: address, // ใช้ชื่อให้ตรงกับที่ส่งมาจาก Frontend (address)
      paymentMethod: paymentMethod,
      // ถ้าจ่ายเงินสดให้เป็น Pending ถ้าโอนเงินให้รอชำระ
      status: paymentMethod === "Cash on Delivery" ? 'Pending' : 'Waiting for Payment'
    });
    
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error("Order Create Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 3. ดึงออเดอร์ของเฉพาะ User (สำหรับหน้า My Orders)
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

// ✅ 4. แจ้งชำระเงิน/แนบสลิป (URL: PUT /api/orders/:id/pay)
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
        status: 'Paid' // อัปเดตเป็นชำระแล้ว
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลคำสั่งซื้อ" });
    }

    res.json({ success: true, message: "แจ้งชำระเงินสำเร็จ!", data: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 5. อัปเดตสถานะออเดอร์ (สำหรับ Admin/Owner)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
    
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;