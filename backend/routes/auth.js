const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ REGISTER - เพิ่มการจัดการ Error และตรวจสอบข้อมูลให้ละเอียดขึ้น
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // 1. ตรวจสอบว่ากรอกข้อมูลครบไหม
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // 2. เช็คอีเมลซ้ำ
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้ไปแล้ว' });

        // 3. สร้าง User ใหม่
        // ปรับ role ให้รองรับทั้ง shopowner และ user ตามที่คุณต้องการใน App.jsx
        const finalRole = role ? role.toLowerCase() : 'user';
        
        user = new User({ 
            username, 
            email, 
            password, 
            role: finalRole 
        });
        
        await user.save();

        // 4. สร้าง Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '1d' }
        );

        // 5. ส่ง Response กลับ (เพิ่ม success: true เพื่อให้ Frontend เช็คง่ายขึ้น)
        res.status(201).json({ 
            success: true, 
            token, 
            user: { id: user._id, username: user.username, role: user.role } 
        });

    } catch (err) { 
        console.error("Register Error:", err.message);
        res.status(500).json({ msg: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์', error: err.message }); 
    }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // เช็คว่ากรอกข้อมูลไหม
        if (!email || !password) {
            return res.status(400).json({ msg: 'กรุณากรอกอีเมลและรหัสผ่าน' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ msg: 'ไม่พบผู้ใช้นี้ในระบบ' });

        // เช็ครหัสผ่าน (ต้องมั่นใจว่าใน User Model มีฟังก์ชัน comparePassword)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'รหัสผ่านไม่ถูกต้อง' });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '1d' }
        );

        res.json({ 
            success: true,
            token, 
            user: { id: user._id, username: user.username, role: user.role } 
        });
    } catch (err) { 
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์', error: err.message }); 
    }
});

module.exports = router;