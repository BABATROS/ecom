const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // 1. เช็คว่ามีเมลนี้หรือยัง
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้ไปแล้ว' });

        // 2. สร้าง User ใหม่ (รองรับ role ที่ส่งมาจากหน้าบ้าน)
        user = new User({ 
            username, 
            email, 
            password, 
            role: role || 'user' 
        });

        await user.save();

        // 3. 🔥 จุดสำคัญ: ต้องสร้าง Token ให้เลยหลังจากสมัครเสร็จ
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret_key', // กันเหนียวถ้าพี่ลืมตั้งใน .env
            { expiresIn: '1d' }
        );

        // 4. ส่งกลับไปให้ Frontend เอาไปใช้งานต่อได้เลย
        res.status(201).json({ 
            success: true, 
            token, 
            user: { id: user._id, username: user.username, role: user.role } 
        });

    } catch (err) { 
        console.error("🔥 Register Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านผิด' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '1d' }
        );

        res.json({ 
            token, 
            user: { id: user._id, username: user.username, role: user.role } 
        });

    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;