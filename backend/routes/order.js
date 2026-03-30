const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon'); // ➕ ดึง Coupon Model มาใช้คำนวณส่วนลด
const { protect, sellerOrAdmin } = require('../middleware/authMiddleware');

// ==========================================
// 🛍️ โซนลูกค้า (Customer)
// ==========================================

// 🛡️ [USER] สร้างออเดอร์ใหม่ (จุดสำคัญ: ห้ามเชื่อราคาจาก Frontend)
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "ไม่มีสินค้าในตะกร้า" });
    }

    let subTotal = 0;
    const orderItems = [];

    // 1. 🔍 ตรวจสอบสินค้าและคำนวณราคาใหม่จาก Database
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ success: false, message: `ไม่พบสินค้า ID: ${item.product}` });
      }

      // เช็กสต็อกของไซส์ที่ลูกค้าเลือก
      const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
      if (sizeIndex === -1 || product.sizes[sizeIndex].stock < item.quantity) {
        return res.status(400).json({ success: false, message: `สินค้า ${product.name} ไซส์ ${item.size} สินค้าหมดหรือไม่พอ` });
      }

      // คำนวณราคาจริง
      subTotal += product.price * item.quantity;
      
      // เตรียมข้อมูลยัดลง Order (เก็บราคากับเจ้าของร้านไว้ด้วย)
      orderItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        price: product.price, // 🔒 ล็อคราคา ณ วันที่ซื้อ
        image: product.images[0] || null,
        shopOwner: product.owner // 🔗 จำเป็นสำหรับระบบร้านค้า
      });
    }

    // 2. 🚚 คำนวณค่าส่ง (สมมติว่าค่าส่ง 50 บาท)
    let shippingFee = 50; 
    let discount = 0;
    let appliedCoupon = { code: null, discount: 0 };

    // 3. 🎫 ตรวจสอบคูปอง (ถ้ามีการกรอกมา)
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (coupon) {
        const validation = coupon.isValid(subTotal);
        if (validation.valid) {
          if (coupon.discountType === 'amount') discount = coupon.discountValue;
          if (coupon.discountType === 'percent') discount = (subTotal * coupon.discountValue) / 100;
          if (coupon.discountType === 'free_shipping') {
             discount = shippingFee; // ลดค่าส่ง
             shippingFee = 0;
          }
          
          appliedCoupon = { code: coupon.code, discount };

          // ตัดยอดสิทธิ์คูปอง (ถ้ามีการจำกัดจำนวน)
          if (coupon.usageLimit !== null) {
            coupon.usedCount += 1;
            await coupon.save();
          }
        }
      }
    }

    // 4. 💵 สรุปยอดเงินสุทธิ
    const totalPrice = subTotal + shippingFee - discount;

    // 5. 📝 สร้าง Order ลง Database
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      subTotal,
      shippingFee,
      coupon: appliedCoupon,
      totalPrice: totalPrice > 0 ? totalPrice : 0, // ยอดรวมห้ามติดลบ
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? 'Pending' : 'Pending',
      orderStatus: 'Processing'
    });

    const savedOrder = await order.save();

    // 6. ⚡ ตัดสต็อกสินค้า (แยกตามไซส์)
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product, "sizes.size": item.size },
        { 
          $inc: { 
            "sizes.$.stock": -item.quantity, // ลดสต็อกไซส์นั้นๆ
            totalStock: -item.quantity,      // ลดสต็อกรวม
            sold: item.quantity              // เพิ่มยอดขาย
          } 
        }
      );
    }

    res.status(201).json({ success: true, data: savedOrder });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างออเดอร์' });
  }
});


// 📦 [USER] ดึงออเดอร์ของตัวเองทั้งหมด
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }); 
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔎 [USER/ADMIN] ดูรายละเอียดออเดอร์ 1 รายการ
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
    
    // ตรวจสอบสิทธิ์: ถ้าเป็น user ธรรมดา ต้องดูได้แค่ของตัวเอง
    if (order.user._id.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 💸 [USER] แจ้งชำระเงิน (อัปโหลดสลิป)
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const { paymentSlip } = req.body; 
    
    if (!paymentSlip) return res.status(400).json({ success: false, message: "กรุณาแนบรูปภาพสลิป" });

    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });

    order.paymentSlip = paymentSlip;
    order.paymentStatus = 'Pending'; // เปลี่ยนสถานะการจ่ายเงินเป็นรอยืนยัน
    order.paidAt = Date.now();
    
    await order.save();
    res.json({ success: true, message: "แนบสลิปสำเร็จ! รอทีมงานตรวจสอบ", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🛡️ โซนเจ้าของร้านและแอดมิน (Admin/Owner)
// ==========================================

// 📋 [ADMIN/OWNER] ดึงรายการออเดอร์
router.get('/', protect, sellerOrAdmin, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      // ถ้าระดับ Owner/Seller ให้ดูเฉพาะออเดอร์ที่มีสินค้าของร้านตัวเอง
      query = { "items.shopOwner": req.user.id };
    }

    const orders = await Order.find(query).populate('user', 'username email').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔄 [ADMIN/OWNER] อัปเดตสถานะออเดอร์และเลขพัสดุ
router.put('/:id/status', protect, sellerOrAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body; 
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (orderStatus === 'Shipped' && !updateData.shippedAt) updateData.shippedAt = Date.now();

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
    res.json({ success: true, message: "อัปเดตออเดอร์สำเร็จ", data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🗑️ [ADMIN] ลบออเดอร์
router.delete('/:id', protect, sellerOrAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });

    // 💡 ถ้าจะให้ลบแล้วคืนสต็อก ต้องเขียนลูปเพิ่มยอดสินค้า (ตัวเลือกเสริม)

    await order.deleteOne();
    res.json({ success: true, message: "ลบออเดอร์ออกจากระบบแล้ว" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;