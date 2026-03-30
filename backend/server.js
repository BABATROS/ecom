const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// 1. ตรวจสอบและสร้างโฟลเดอร์ uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Middleware
app.use(cors({ origin: true, credentials: true })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// 3. API Routes 
// ✅ แก้ไข: เชื่อม Path '/api/products' เข้ากับไฟล์ './routes/product' (ที่ไม่มี s)
try {
  app.use('/api/auth', require('./routes/auth'));        
  app.use('/api/products', require('./routes/product')); // 🔥 แก้ตรงนี้ให้ใช้ได้จริง
} catch (error) {
  console.error("⚠️ Route Mount Error:", error.message);
}

// 4. Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Sneaker Hub Backend is Live', status: 'Online' });
});

// 5. Error Handling
app.use((req, res) => {
  res.status(404).json({ error: `ไม่พบ Path ${req.originalUrl} บนเซิร์ฟเวอร์นี้` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 6. Database Connection
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
  if (!MONGO_URI) return console.error('❌ Missing MONGO_URI');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Atlas Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
  }
};
connectDB();

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));