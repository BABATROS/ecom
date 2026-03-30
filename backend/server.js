const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const app = express();

// 🛡️ 1. CORS ต้องมาก่อนเพื่อนเสมอ! (สำคัญมากเพื่อกัน Preflight OPTIONS error)
const allowedOrigins = [
  'http://localhost:5173', 
  'https://ecom-nig-r.onrender.com',
  'https://ecom-500.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // อนุญาตถ้าไม่มี origin (เช่น ยิงผ่าน Postman) หรือ origin อยู่ในลิสต์
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS ไม่อนุญาตให้โดเมนนี้เข้าถึง!'));
    }
  },
  credentials: true
}));

// 🛡️ 2. Body Parser ต้องมาถัดไป เพื่อให้อ่าน req.body ได้
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ 3. Security Middlewares (วางหลัง CORS และ Body Parser)
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(mongoSanitize());

// 🛡️ 4. Rate Limiting 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'ยิง Request บ่อยเกินไปว้อย! พักก่อน 15 นาทีนะ' }
});
app.use('/api', limiter);

// 📂 5. จัดการไฟล์ Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// 🚀 6. Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Online', message: 'Sneaker Hub Ready' }));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Path ${req.originalUrl} หาไม่เจอว้อย!` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || 'ระบบหลังบ้านพังชั่วคราว ขอกู้ชีพแป๊บ!',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

mongoose.set('strictQuery', true);

// 🗄️ 7. MongoDB (ดักไว้ให้รองรับทั้ง MONGO_URI และ MONGODB_URI เผื่อตั้งชื่อสลับกัน)
const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!dbUri) {
  console.error('❌ DB Error: ไม่พบ MONGO_URI หรือ MONGODB_URI ในไฟล์ .env');
} else {
  mongoose.connect(dbUri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ DB Error:', err.message));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));