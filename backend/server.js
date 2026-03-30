const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 🛡️ นำเข้า Security Packages (OWASP)
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 🛡️ 1. ตั้งค่าความปลอดภัย (OWASP)
app.use(helmet({ crossOriginResourcePolicy: false })); // ปิด policy บางตัวเพื่อให้หน้าเว็บดึงรูปภาพจาก /uploads ได้
app.use(mongoSanitize()); // ป้องกัน NoSQL Injection

// 🛡️ 2. Rate Limiting (จำกัดการยิง Request ป้องกัน Brute Force/DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100, // จำกัด 100 requests ต่อ IP ใน 15 นาที
  message: { error: 'ยิง Request บ่อยเกินไปว้อย! พักก่อน 15 นาทีนะ' }
});
app.use('/api', limiter); // ใช้กับทุก Route ที่ขึ้นต้นด้วย /api

// 🛡️ 3. ปรับ CORS ให้รับเฉพาะโดเมนที่อนุญาต
const allowedOrigins = ['http://localhost:5173', 'https://ecom-nig-r.onrender.com'];
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS ไม่อนุญาตให้โดเมนนี้เข้าถึง!'));
    }
  }, 
  credentials: true 
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// ✅ 4. รวม Routes ทั้งหมด (เพิ่มของที่ขาดหายไป)
app.use('/api/auth', require('./routes/auth'));        
app.use('/api/products', require('./routes/product')); 
app.use('/api/orders', require('./routes/order'));     // ➕ เพิ่ม Route คำสั่งซื้อ
app.use('/api/coupons', require('./routes/coupons'));  // ➕ เพิ่ม Route คูปอง
app.use('/api/upload', require('./routes/upload'));    // ➕ เพิ่ม Route อัปโหลดไฟล์ (สลิป/รูปสินค้า)

app.get('/', (req, res) => res.json({ status: 'Online', message: 'Sneaker Hub Ready' }));

// Error Handling (404)
app.use((req, res) => {
  res.status(404).json({ error: `Path ${req.originalUrl} หาไม่เจอว้อย!` });
});

// 🛡️ 5. Global Error Handler (จัดการ Error 500 ไม่ให้แอปแครช)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'ระบบหลังบ้านพังชั่วคราว ขอกู้ชีพแป๊บ!',
    // บังคับไม่ให้โชว์ stack trace ใน production เพื่อความปลอดภัย
    stack: process.env.NODE_ENV === 'production' ? null : err.stack 
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));