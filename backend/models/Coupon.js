const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: [true, 'กรุณาระบุรหัสคูปอง'], 
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'รหัสคูปองต้องมีความยาวอย่างน้อย 3 ตัวอักษร']
  },
  discountType: { 
    type: String, 
    enum: {
      values: ['amount', 'percent', 'free_shipping'],
      message: 'ประเภทส่วนลดไม่ถูกต้อง (ระบุได้เพียง: amount, percent, free_shipping)'
    },
    default: 'amount' 
  },
  discountValue: { 
    type: Number, 
    required: [true, 'กรุณาระบุค่าส่วนลด'],
    min: [0, 'ค่าส่วนลดต้องไม่น้อยกว่า 0']
  },
  minCartTotal: { 
    type: Number, 
    default: 0,
    min: [0, 'ยอดสั่งซื้อขั้นต่ำต้องไม่น้อยกว่า 0']
  },
  // 📅 เพิ่มวันหมดอายุ
  expiryDate: {
    type: Date,
    required: [true, 'กรุณาระบุวันหมดอายุคูปอง']
  },
  // 🔢 จำกัดจำนวนสิทธิ์
  usageLimit: {
    type: Number,
    default: null // null คือใช้ได้ไม่จำกัด
  },
  usedCount: {
    type: Number,
    default: 0
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  // 👤 ผู้สร้าง (Admin หรือ ShopOwner)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ต้องระบุผู้สร้างคูปอง']
  }
}, { 
  timestamps: true 
});

// ✅ เพิ่ม Method สำหรับตรวจสอบว่าคูปองยังใช้งานได้อยู่หรือไม่
CouponSchema.methods.isValid = function(cartTotal) {
  const now = new Date();
  
  // 1. เช็คสถานะ Active
  if (!this.active) return { valid: false, msg: 'คูปองนี้ถูกปิดใช้งานแล้ว' };
  
  // 2. เช็ควันหมดอายุ
  if (this.expiryDate && now > this.expiryDate) return { valid: false, msg: 'คูปองนี้หมดอายุแล้ว' };
  
  // 3. เช็คจำนวนสิทธิ์ที่เหลือ
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, msg: 'คูปองนี้ถูกใช้งานครบจำนวนสิทธิ์แล้ว' };
  }
  
  // 4. เช็คยอดสั่งซื้อขั้นต่ำ
  if (cartTotal < this.minCartTotal) {
    return { valid: false, msg: `ยอดสั่งซื้อไม่ถึงขั้นต่ำ ฿${this.minCartTotal.toLocaleString()}` };
  }

  return { valid: true };
};

module.exports = mongoose.model('Coupon', CouponSchema);