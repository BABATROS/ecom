const dns = require('dns');
dns.setServers(['8.8.8.8','1.1.1.1']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// 1. Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const uploadRoutes = require('./routes/upload');
const couponRoutes = require('./routes/coupons');

const app = express();

// 2. Middleware
app.use(cors({ origin: true, credentials: true })); // ✅ ปรับ CORS ให้เสถียรขึ้น
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ การจัดการไฟล์รูปภาพ
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. API Routes
app.use('/api/auth', authRoutes);         
app.use('/api/products', productRoutes);  
app.use('/api/orders', orderRoutes);      
app.use('/api/upload', uploadRoutes);     
app.use('/api/coupons', couponRoutes);    // Route คูปอง

app.get('/', (req, res) => {
  res.json({ message: 'Sneaker Hub Backend is running properly' });
});

// 4. Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecom';
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/ecom';
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
};

mongoose.connect(MONGO_URI, mongoOptions)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection error:', err.message);
    if (MONGO_URI.startsWith('mongodb+srv://')) {
      console.log('⚠️ Atlas SRV failed; trying local MongoDB...');
      mongoose.connect(LOCAL_MONGO_URI, mongoOptions)
        .then(() => console.log('✅ Local MongoDB Connected'))
        .catch((err2) => console.error('❌ Local MongoDB Connection error:', err2.message));
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});