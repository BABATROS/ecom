const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// 1. จัดการโฟลเดอร์ uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 2. Middleware
app.use(cors({ origin: true, credentials: true })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// 3. API Routes 
try {
  // ✅ ต้องมีบรรทัดนี้! เพื่อให้ Register ทำงานได้ (ดึงจาก routes/auth.js)
  app.use('/api/auth', require('./routes/auth'));        
  
  // ✅ เชื่อม Path มี s ไปหาไฟล์ที่ไม่มี s (ตามที่พี่ตั้งชื่อไว้)
  app.use('/api/products', require('./routes/product')); 
  
} catch (error) {
  console.error("⚠️ Route Error (เช็คชื่อไฟล์ในโฟลเดอร์ routes):", error.message);
}

// 4. Default Route
app.get('/', (req, res) => res.json({ status: 'Online', message: 'Sneaker Hub Ready' }));

// 5. Error Handling (404)
app.use((req, res) => {
  res.status(404).json({ error: `Path ${req.originalUrl} หาไม่เจอว้อย!` });
});

// 6. DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Error:', err.message));

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));