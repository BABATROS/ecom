const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'กรุณาระบุชื่อผู้ใช้งาน'],
    trim: true,
    minlength: [3, 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร']
  },
  email: { 
    type: String, 
    required: [true, 'กรุณาระบุอีเมล'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'กรุณาระบุอีเมลที่ถูกต้อง']
  },
  password: { 
    type: String, 
    required: [true, 'กรุณาระบุรหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'],
    select: false // เมื่อ Query ข้อมูล จะไม่ดึง Password ออกมาโดยอัตโนมัติ (เพื่อความปลอดภัย)
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'shopowner', 'admin'],
      message: 'บทบาทไม่ถูกต้อง'
    },
    default: 'user'
  },
  profileImage: { 
    type: String, 
    default: '' 
  },
  // 🛡️ เพิ่มฟิลด์สำหรับการกู้คืนรหัสผ่าน
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { 
  timestamps: true 
});

/**
 * 🔐 Middleware: Hash Password ก่อนบันทึกลงฐานข้อมูล
 */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * 🛡️ Instance Method: ตรวจสอบรหัสผ่าน (ใช้ในหน้า Login)
 */
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);