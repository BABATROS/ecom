const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// 1. ตรวจสอบและสร้างโฟลเดอร์ uploads อัตโนมัติ (ไว้บนสุด)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created "uploads" directory');
}

// 2. Middleware
// ✅ ปรับ CORS ให้ฉลาดขึ้น รองรับทั้ง Localhost (Vite) และโดเมนบน Render
app.use(cors({ 
  origin: function (origin, callback) {
    // ให้ผ่านหมดเพื่อตัดปัญหาบล็อกข้ามโดเมนตอน Dev/Deploy
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ เปิดโฟลเดอร์ให้อ่านรูปภาพได้
app.use('/uploads', express.static(uploadDir));

// 3. API Routes (ใช้ Try-Catch ครอบไว้ กันเซิร์ฟเวอร์พังถ้าพี่ลืมสร้างไฟล์ไหนไป)
try {
  app.use('/api/auth', require('./routes/auth'));        
  app.use('/api/products', require('./routes/product')); // ดึงไฟล์จากชื่อ product.js

  // ถ้าพี่เพิ่งทำถึงแค่ auth กับ product ให้คอมเมนต์ 3 บรรทัดล่างนี้ไว้ก่อนครับ
  // พอสร้างไฟล์ในโฟลเดอร์ routes เสร็จค่อยเอาคอมเมนต์ออก (จะได้ไม่บัค 404)
  // app.use('/api/orders', require('./routes/order'));      
  // app.use('/api/upload', require('./routes/upload'));     
  // app.use('/api/coupons', require('./routes/coupons'));   
} catch (error) {
  console.error("⚠️ Mount Route Error (เช็คชื่อไฟล์ในโฟลเดอร์ routes):", error.message);
}

// 4. Default Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sneaker Hub Backend is running properly',
    status: 'Online',
    timestamp: new Date()
  });
});

// ✅ 5. Error Handling: 404 (หา Path ไม่เจอ)
app.use((req, res, next) => {
  res.status(404).json({ error: `Path ${req.originalUrl} not found on this server.` });
});

// ✅ Error Handling: 500 (ดักจับ Error ในระบบ ไม่ให้เซิร์ฟเวอร์ดับ)
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 6. Database Connection (เวอร์ชันเอาตัวรอดบน Cloud)
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('❌ ไม่พบ MONGO_URI ในไฟล์ .env (ไปเพิ่มใน Variables ของ Render ด้วยครับ)');
    return;
  }
  
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // ให้เวลาคิดนานหน่อยเวลาเน็ต Cloud แกว่ง
    });
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Atlas Error:', err.message);
    // 🚫 ห้ามใช้ process.exit(1) หรือ Local Fallback บน Render เด็ดขาด
    // ปล่อยให้มันแสดง Error ใน Log แต่รัน API ตัวอื่นที่ไม่ง้อ DB ต่อไปได้
  }
};

connectDB();

// 7. Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Sneaker Hub Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close();
    console.log('👋 Server closed.');
  });
});