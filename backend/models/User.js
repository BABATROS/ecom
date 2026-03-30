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
    default: 'customer' // ปรับค่าเริ่มต้นให้เป็น customer เพื่อให้เข้าใจง่ายขึ้น
  },
  
  // ✅ 1. เพิ่มฟิลด์สำหรับระบบ "แก้ไขข้อมูลส่วนตัว"
  phone: { type: String, default: '' },
  address: { type: String, default: '' },

  // ✅ 2. เพิ่มฟิลด์สำหรับระบบ "ลืมรหัสผ่าน / รีเซ็ตรหัส"
  resetPasswordToken: String,
  resetPasswordExpire: Date

}, { timestamps: true });

// 🔥 ฉบับสมบูรณ์: ใช้ async/await เพียวๆ ไม่ต้องพึ่งพาตัวแปร next เพื่อตัดปัญหา 100%
UserSchema.pre('save', async function() {
  // 1. ถ้าไม่ได้แก้รหัสผ่าน หรือไม่ใช่การสร้าง user ใหม่ ให้ข้ามไปเลย
  if (!this.isModified('password')) {
    return; 
  }

  try { 
    // 2. เข้ารหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // 3. จบการทำงานแค่นี้เลย! Mongoose จะจัดการเซฟลง Database ต่อให้เองแบบหล่อๆ
  } catch (error) {
    // 4. ถ้ามี Error ให้โยนกลับไปให้ไฟล์ auth.js จัดการ
    throw error; 
  }
});

// ฟังก์ชันเทียบรหัสผ่านตอน Login
UserSchema.methods.comparePassword = async function(pass) {
  return await bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('User', UserSchema);