const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // แก้ไขปัญหา DNS resolution สำหรับ MongoDB Atlas

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 1. Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const uploadRoutes = require('./routes/upload');
const couponRoutes = require('./routes/coupons');

const app = express();

// ✅ ตรวจสอบและสร้างโฟลเดอร์ uploads อัตโนมัติ
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created "uploads" directory');
}

// 2. Middleware
app.use(cors({ 
  origin: process.env.FRONTEND_URL || true, // แนะนำให้ใส่ URL ของ React ใน .env
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ การจัดการไฟล์รูปภาพ (ให้เข้าถึงได้ผ่าน URL /uploads/ชื่อไฟล์)
app.use('/uploads', express.static(uploadDir));

// 3. API Routes
app.use('/api/auth', authRoutes);         
app.use('/api/products', productRoutes);  
app.use('/api/orders', orderRoutes);      
app.use('/api/upload', uploadRoutes);     
app.use('/api/coupons', couponRoutes);    

app.get('/', (req, res) => {
  res.json({ 
    message: 'Sneaker Hub Backend is running properly',
    status: 'Online',
    timestamp: new Date()
  });
});

// ✅ Error Handling สำหรับ Route ที่ไม่มีอยู่จริง
app.use((req, res, next) => {
  res.status(404).json({ error: `Path ${req.originalUrl} not found on this server.` });
});

// 4. Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecom';
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/ecom';

const mongoOptions = {
  serverSelectionTimeoutMS: 10000, // รอ 10 วินาทีก่อน Timeout
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, mongoOptions);
    console.log('✅ MongoDB Atlas Connected');
  } catch (err) {
    console.error('❌ MongoDB Atlas Error:', err.message);
    console.log('⚠️ Attempting fallback to local MongoDB...');
    try {
      await mongoose.connect(LOCAL_MONGO_URI, mongoOptions);
      console.log('✅ Local MongoDB Connected');
    } catch (err2) {
      console.error('❌ Critical Error: All MongoDB connections failed', err2.message);
      process.exit(1); // ปิดแอปทันทีถ้าต่อ DB ไม่ได้เลย
    }
  }
};

connectDB();

// 5. Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Sneaker Hub Server running on port ${PORT}`);
  console.log(`📂 Static files served from: ${uploadDir}`);
});

// ✅ ปิดการเชื่อมต่ออย่างนุ่มนวล (Graceful Shutdown)
process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close();
    console.log('👋 Server and DB connection closed.');
  });
});