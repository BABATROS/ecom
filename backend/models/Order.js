const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // 🆔 รหัสคำสั่งซื้อแบบอ่านง่าย (เช่น SH-20240520-1234)
  orderNumber: {
    type: String,
    unique: true
  },
  // 👤 ลูกค้าที่เป็นคนสั่งซื้อ
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'ต้องระบุผู้ซื้อ'] 
  },
  // 🛒 สินค้าในตะกร้า
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    size: { type: String, required: true }, // 👟 ไซส์รองเท้า
    quantity: { type: Number, required: true, min: [1, 'จำนวนต้องอย่างน้อย 1 ชิ้น'] },
    price: { type: Number, required: true }, // 🔒 ล็อคราคาสินค้า ณ วันที่ซื้อ (เผื่ออนาคตราคาเปลี่ยน)
    image: { type: String },
    // 🏪 สำคัญมาก: ระบุว่าสินค้านี้เป็นของเจ้าของร้านคนไหน (รองรับระบบ Multi-vendor)
    shopOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }],

  // 💰 สรุปยอดเงิน (Financial Breakdown)
  subTotal: { type: Number, required: true, default: 0 }, // ยอดรวมสินค้า (ก่อนหักส่วนลด)
  shippingFee: { type: Number, required: true, default: 0 }, // ค่าจัดส่ง
  coupon: {
    code: { type: String, default: null }, // ชื่อโค้ด
    discount: { type: Number, default: 0 } // ยอดที่ลดไป
  },
  totalPrice: { 
    type: Number, 
    required: [true, 'ต้องมียอดรวมสุทธิ'], // ยอดสุทธิ (subTotal + shippingFee - discount)
    min: [0, 'ยอดรวมห้ามติดลบ']
  },

  // 📍 ที่อยู่จัดส่ง
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    detail: { type: String, required: true }
  },

  // 💳 การชำระเงิน
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['Transfer', 'Cash on Delivery'] // โอนเงิน หรือ เก็บเงินปลายทาง
  },
  paymentSlip: { type: String, default: null }, // URL รูปหลักฐานการโอน
  paidAt: { type: Date }, // วันที่ยืนยันการชำระเงิน

  // 🏷️ สถานะแยกเป็น 2 ส่วนให้จัดการง่ายขึ้น
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending' // รอชำระเงิน
  },
  orderStatus: { 
    type: String, 
    enum: [
      'Processing',  // กำลังจัดเตรียมสินค้า
      'Shipped',     // จัดส่งแล้ว
      'Completed',   // ลูกค้ารับสินค้าเรียบร้อย
      'Cancelled'    // ยกเลิกออเดอร์
    ], 
    default: 'Processing' 
  },
  
  // 📦 การจัดส่ง
  trackingNumber: { type: String, default: null }, 
  shippedAt: { type: Date } // วันที่จัดส่ง
  
}, { 
  timestamps: true // เก็บ createdAt (วันที่สั่งซื้อ) และ updatedAt
});

// ✅ Middleware: สร้าง Order Number ก่อนบันทึกครั้งแรก
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // สร้างรูปแบบ SH-YYYYMMDD-XXXX (เช่น SH-20260330-8492)
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `SH-${date}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);