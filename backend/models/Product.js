const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'กรุณาระบุชื่อสินค้า'], 
    trim: true,
    index: true 
  },
  brand: { 
    type: String, 
    required: [true, 'กรุณาระบุยี่ห้อสินค้า'],
    default: 'No Brand',
    trim: true,
    index: true
  },
  // 🔗 Slug สำหรับ URL (เช่น /product/nike-air-force-1-07-xyz)
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  description: { 
    type: String, 
    default: '' 
  },
  price: { 
    type: Number, 
    required: [true, 'กรุณาระบุราคา'],
    min: [0, 'ราคาต้องไม่ต่ำกว่า 0']
  },
  category: { 
    type: String, 
    required: [true, 'กรุณาระบุหมวดหมู่'],
    default: 'Sneaker',
    enum: ['Sneaker', 'Streetwear', 'Accessories', 'Limited']
  },
  // 👟 เก็บสต็อกแยกตามไซส์
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 }
  }],
  // 📦 สต็อกรวม (คำนวณอัตโนมัติ)
  totalStock: {
    type: Number,
    default: 0
  },
  // 📈 ยอดขาย (เอาไว้เรียงสินค้าขายดี)
  sold: {
    type: Number,
    default: 0
  },
  condition: {
    type: String,
    enum: ['New', 'Used', 'Deadstock'],
    default: 'New'
  },
  images: {
    type: [String],
    validate: {
      validator: function(val) {
        return val && val.length > 0;
      },
      message: 'ต้องมีรูปภาพอย่างน้อย 1 รูป'
    }
  },
  video: { 
    type: String, 
    default: null 
  },
  // 🛡️ หัวใจหลัก: ระบุว่าใครเป็นเจ้าของสินค้า
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'สินค้าต้องมีเจ้าของ (Owner ID)'] 
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { 
  timestamps: true 
});

// ✅ สร้าง Indexes
ProductSchema.index({ owner: 1 });
ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

/**
 * ⚡ Middleware: ก่อนบันทึกข้อมูล (save)
 */
ProductSchema.pre('save', function(next) {
  // 1. คำนวณสต็อกรวม
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((sum, item) => sum + item.stock, 0);
  }
  
  // 2. สร้าง slug (รองรับภาษาไทย + สุ่มตัวอักษรกันชื่อซ้ำ)
  if (!this.slug || this.isModified('name')) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]/g, '-') // 🇹🇭 อนุญาตให้ใช้ภาษาไทย (ก-๙)
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
      
    // สุ่มรหัส 4 ตัวต่อท้าย เผื่อชื่อสินค้าซ้ำกัน Slug จะได้ไม่ชนกัน
    const randomString = Math.random().toString(36).substring(2, 6);
    this.slug = baseSlug ? `${baseSlug}-${randomString}` : randomString;
  }
  
  next();
});

module.exports = mongoose.model('Product', ProductSchema);