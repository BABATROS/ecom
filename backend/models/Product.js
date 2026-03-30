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
  // 🔗 Slug สำหรับ URL (เช่น /product/nike-air-force-1-07)
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
  // 👟 เก็บสต็อกแยกตามไซส์ (รองรับการทำสต็อกละเอียด)
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 }
  }],
  // 📦 สต็อกรวม (จะถูกคำนวณอัตโนมัติจากผลรวมของ sizes)
  totalStock: {
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
  // 🛡️ หัวใจหลัก: ระบุว่าใครเป็นเจ้าของสินค้าชิ้นนี้
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

// ✅ สร้าง Indexes เพื่อให้ Query "สินค้าของฉัน" ได้เร็วขึ้น
ProductSchema.index({ owner: 1 });
ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

/**
 * ⚡ Middleware: ก่อนบันทึกข้อมูล (save)
 * 1. คำนวณ totalStock จากผลรวมสต็อกในแต่ละ size
 * 2. สร้าง slug อัตโนมัติจากชื่อสินค้า
 */
ProductSchema.pre('save', function(next) {
  // คำนวณสต็อกรวม
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((sum, item) => sum + item.stock, 0);
  }
  
  // สร้าง slug (ทำความสะอาดชื่อภาษาอังกฤษให้เป็นรูปแบบ url-friendly)
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);