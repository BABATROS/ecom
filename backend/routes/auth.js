const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ➕ สำหรับสุ่ม Token รีเซ็ตรหัสผ่าน
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // ➕ ดึงด่านตรวจมาใช้

// ✅ REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้งานแล้ว' });

        const finalRole = role ? role.toLowerCase() : 'customer'; // แนะนำใช้ customer เป็นค่าเริ่มต้น
        
        user = new User({ 
            username, 
            email, 
            password, 
            role: finalRole 
        });
        
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, // 🛡️ ลบ fallback 'secret' ออก บังคับให้ใช้จาก .env เพื่อความปลอดภัย
            { expiresIn: '1d' }
        );

        res.status(201).json({ 
            success: true, 
            token, 
            user: { id: user._id, username: user.username, role: user.role } 
        });

    } catch (err) { 
        console.error("Register Error:", err.message);
        res.status(500).json({ msg: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }); 
    }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ msg: 'กรุณากรอกอีเมลและรหัสผ่าน' });
        }

        const user = await User.findOne({ email }).select('+password');
        
        // 🛡️ OWASP: รวม Error เป็นข้อความเดียว ป้องกันแฮกเกอร์รู้ว่าอีเมลมีในระบบหรือไม่
        if (!user) {
            return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({ 
            success: true,
            token, 
            user: { id: user._id, username: user.username, role: user.role } 
        });
    } catch (err) { 
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }); 
    }
});

// ✅ GET PROFILE - ดูข้อมูลส่วนตัว (ต้อง Login)
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'ไม่พบข้อมูลผู้ใช้' });
        
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ msg: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
});

// ✅ UPDATE PROFILE - แก้ไขข้อมูลส่วนตัว (ต้อง Login)
router.put('/profile', protect, async (req, res) => {
    try {
        const { username, phone, address } = req.body;
        
        // ค้นหาและอัปเดตข้อมูล (หาจาก ID ที่ได้มาจาก Token)
        const user = await User.findByIdAndUpdate(
            req.user.id, 
            { username, phone, address }, // อนุญาตให้แก้แค่ฟิลด์เหล่านี้ ป้องกันการแก้ Role
            { new: true, runValidators: true }
        );

        res.json({ success: true, msg: 'อัปเดตข้อมูลสำเร็จ', user });
    } catch (err) {
        res.status(500).json({ msg: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});

// ✅ FORGOT PASSWORD - ขอลิงก์รีเซ็ตรหัสผ่าน
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ msg: 'ไม่พบอีเมลนี้ในระบบ' });
        }

        // สร้าง Token แบบสุ่ม
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash Token เก็บลง Database ป้องกัน Token หลุด (ต้องไปเพิ่มฟิลด์ใน User Model)
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // หมดอายุใน 10 นาที

        await user.save({ validateBeforeSave: false });

        // ลิงก์ที่จะส่งให้ลูกค้า (อ้างอิง URL หน้า Frontend ของคุณ)
        const resetUrl = `https://ecom-nig-r.onrender.com/reset-password/${resetToken}`;

        // 💡 หมายเหตุ: ตอนนี้จำลองการส่ง URL กลับไปก่อน ถ้ามีระบบส่งเมล (Nodemailer) ค่อยเอาไปใส่ในเมล
        res.json({ 
            success: true, 
            msg: 'กรุณาตรวจสอบลิงก์สำหรับรีเซ็ตรหัสผ่าน',
            mockEmailData: resetUrl 
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ msg: 'ไม่สามารถส่งคำขอได้' });
    }
});

// ✅ RESET PASSWORD - ตั้งรหัสผ่านใหม่
router.put('/reset-password/:token', async (req, res) => {
    try {
        // นำ Token จาก URL มา Hash เพื่อนำไปเทียบกับใน Database
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } // เช็คว่า Token ยังไม่หมดอายุ
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token ไม่ถูกต้อง หรือหมดอายุแล้ว' });
        }

        // ตั้งรหัสผ่านใหม่ (ต้องกรอกรหัสใหม่มาใน req.body.password)
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, msg: 'เปลี่ยนรหัสผ่านสำเร็จ สามารถเข้าสู่ระบบได้เลย' });

    } catch (err) {
        res.status(500).json({ msg: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' });
    }
});

module.exports = router;