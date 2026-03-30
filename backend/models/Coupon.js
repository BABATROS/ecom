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
  // 📅 วันหมดอายุ
  expiryDate: {
    type: Date,
    required: [true, 'กรุณาระบุวันหมดอายุคูปอง']
  },
  // 🔢 จำกัดจำนวนสิทธิ์ (null = อัลลิมิต)
  usageLimit: {
    type: Number,
    default: null 
  },
  usedCount: {
    type: Number,
    default: 0
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  // 🏪 ผู้สร้าง (แอดมินสร้างจะเป็นคูปองกลาง / ร้านค้าสร้างจะเป็นคูปองเฉพาะร้าน)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ต้องระบุผู้สร้างคูปอง']
  },
  // 🔗 ระบุร้านค้าที่สามารถใช้คูปองนี้ได้ (ถ้าเป็น null แปลว่าใช้ได้กับทุกร้าน - คูปองแอดมิน)
  applicableShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true 
});

// ✅ สร้าง Index เพื่อความเร็วตอนลูกค้ากรอกหาโค้ดส่วนลด
CouponSchema.index({ code: 1, active: 1, expiryDate: 1 });

// ✅ Custom Validator ป้องกันการตั้งส่วนลดเกิน 100% ถ้าเป็นแบบ percent
CouponSchema.path('discountValue').validate(function(value) {
  if (this.discountType === 'percent' && value > 100) {
    return false;
  }
  return true;
}, 'ส่วนลดแบบเปอร์เซ็นต์ (percent) ต้องไม่เกิน 100%');


// ✅ Method ตรวจสอบคูป