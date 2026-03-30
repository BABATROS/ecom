const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Online', message: 'Sneaker Hub Ready' }));

// 404 handler (ต้องอยู่หลัง routes)
app.use((req, res, next) => {
  res.status(404).json({ error: `Path ${req.originalUrl} หาไม่เจอว้อย!` });
});

// Global error handler (ต้องมี 4 พารามิเตอร์)
app.use((err, req, res, next) => {
  console.error('Global Error:', err && err.stack ? err.stack : err);
  // ถ้า response ถูกส่งไปแล้ว ให้เรียก next เพื่อให้ Express จัดการต่อ
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' : (err.message || 'Internal Server Error');
  res.status(status).json({ error: message });
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ DB Error:', err.message);
    // ถ้าเชื่อม DB ไม่ได้ อาจจะปิดโปรเซสหรือรอ retry ขึ้นกับนโยบายของคุณ
  });

// Process-level handlers (ช่วยจับ unhandled errors)
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // ใน production อาจ restart process
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
