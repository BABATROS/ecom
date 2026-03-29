const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: 'Sneaker' },
  stock: { type: Number, default: 0 },
  images: [{ type: String }], // เก็บชื่อไฟล์รูปภาพ (เช่น 123-shoe.jpg)
  video: { type: String },     // เก็บชื่อไฟล์วิดีโอ (เช่น 123-review.mp4)
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);