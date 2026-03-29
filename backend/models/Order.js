const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true }, // เก็บชื่อสินค้าไว้ดูย้อนหลัง
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String } // เก็บรูปสินค้าไว้ดูย้อนหลัง
  }],
  total: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['Transfer', 'Cash on Delivery'] 
  }, // ✅ เพิ่มฟิลด์นี้เพื่อให้ระบบแยกประเภทการชำระเงินได้
  coupon: { type: String, default: null },
  paymentSlip: { type: String, default: null }, 
  status: { 
    type: String, 
    // ✅ เพิ่ม 'Waiting for Payment' เพื่อรองรับการโอนเงิน
    enum: ['Waiting for Payment', 'Pending', 'Paid', 'Confirmed', 'Shipped', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);