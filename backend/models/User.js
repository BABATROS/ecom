const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    lowercase: true, 
    enum: ['user', 'customer', 'merchant', 'seller', 'shopowner', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// 🔥 แก้ไขตรงนี้ครับพี่! ต้องรับ next และเรียก next() แบบนี้
UserSchema.pre('save', async function(next) {
  // 1. ถ้าไม่ได้แก้รหัสผ่าน ให้ไปขั้นตอนถัดไปเลย
  if (!this.isModified('password')) return next(); 

  try {
    // 2. เข้ารหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // 3. ✅ สำคัญมาก: ต้องเรียก next() เพื่อบอกว่าทำเสร็จแล้วนะ เซฟลง DB ได้เลย!
    next(); 
  } catch (error) {
    // 4. ถ้ามี Error ให้ส่ง error ไปที่ catch ใน auth.js
    next(error); 
  }
});

UserSchema.methods.comparePassword = async function(pass) {
  return await bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('User', UserSchema);