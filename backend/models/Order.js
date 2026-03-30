const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // 🆔 รหัสคำสั่งซื้อแบบอ่านง่าย (เช่น SH-690123)
  orderNumber: {
    type: String,
    unique: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'ต้องระบุผู้ซื้อ'] 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    size: { type: String, required: true }, // 👟 สำคัญมากสำหรับร้านรองเท้า
    quantity: { type: Number, required: true, min: [1, 'จำนวนต้องอย่างน้อย 1 ชิ้น'] },
    price: { type: Number, required: true },
    image: { type: String }
  }],
  total: { 
    type: Number, 
    required: [true, 'ต้องมียอดรวมราคาสินค้า'],
    min: [0, 'ยอดรวมห้ามติดลบ']
  },
  shippingAddress: {
    name: { type: String, required: true }, // ชื่อผู้รับ
    phone: { type: String, required: true }, // เบอร์ติดต่อ
    detail: { type: String, required: true } // ที่อยู่โดยละเอียด
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: {
      values: ['Transfer', 'Cash on Delivery'],
      message: 'รูปแบบการชำระเงินไม่ถูกต้อง'
    }
  },
  coupon: {
    code: { type: String, default: null },
    discount: { type: Number, default: 0 }
  },
  paymentSlip: { type: String, default: null }, // URL รูปหลักฐานการโอน
  paidAt: { type: Date }, // วันที่แจ้งชำระเงิน
  trackingNumber: { type: String, default: null }, // เลขพัสดุ
  status: { 
    type: String, 
    enum: [
      'Waiting for Payment', // รอโอนเงิน/แนบสลิป
      'Pending',             // รอตรวจสอบ (หลังแนบสลิปหรือเลือก COD)
      'Confirmed',           // ตรวจสอบชำระเงิน/รับออเดอร์แล้ว
      'Shipped',             // จัดส่งแล้ว
      'Completed',           // ลูกค้ารับสินค้าเรียบร้อย
      'Cancelled'            // ยกเลิกออเดอร์
    ], 
    default: 'Waiting for Payment' 
  }
}, { 
  timestamps: true // ใช้ timestamps แทน createdAt ตัวเดียวเพื่อดูวันอัปเดตสถานะ
});

// ✅ Middleware: สร้าง Order Number ก่อนบันทึกครั้งแรก
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `SH-${date}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);