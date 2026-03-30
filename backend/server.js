const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: true, credentials: true })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// ✅ รวมทุก Route ไว้ตรงนี้ (แก้ 404 ทั้งหมด)
app.use('/api/auth', require('./routes/auth'));        
app.use('/api/products', require('./routes/product')); 

app.get('/', (req, res) => res.json({ status: 'Online', message: 'Sneaker Hub Ready' }));

// Error Handling (404)
app.use((req, res) => {
  res.status(404).json({ error: `Path ${req.originalUrl} หาไม่เจอว้อย!` });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));