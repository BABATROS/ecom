const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');

// --- [1. สมัครสมาชิก - Register] ---
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'กรุณากรอกข้อมูลให้ครบ' });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ msg: 'รหัสผ่านไม่ตรงกัน' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้งานแล้ว' });

        // สร้าง User ใหม่ (Password จะถูก Hash อัตโนมัติใน User Model ด้วย pre-save hook)
        user = new User({ 
            username, 
            email, 
            password,
            role: role ? role.toLowerCase() : 'user' 
        });

        await user.save();
        res.status(201).json({ msg: 'ลงทะเบียนสำเร็จ! ยินดีต้อนรับสู่ Sneaker Hub' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [2. เข้าสู่ระบบ - Login] ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // ดึง Password ออกมาด้วยเพราะใน Model เราตั้ง select: false ไว้
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ msg: 'ไม่พบผู้ใช้นี้ในระบบ' });

        // ใช้ Instance Method จาก Model ในการเช็คพาสเวิร์ด
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email, 
                role: user.role, 
                profileImage: user.profileImage 
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [3. ลืมรหัสผ่าน - Forgot Password] ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "ไม่พบอีเมลนี้ในระบบ" });

        res.json({ msg: "ระบบตรวจสอบอีเมลเรียบร้อยแล้ว (ฟีเจอร์ส่ง Email จะตามมาเร็วๆ นี้)" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [4. แก้ไขข้อมูลส่วนตัว - Update Profile] ---
// เพิ่ม protect middleware เพื่อให้แน่ใจว่าต้องล็อกอินก่อน
router.put('/update-profile', protect, async (req, res) => {
    try {
        const { username, email, profileImage } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, // ใช้ ID จาก Token เพื่อความปลอดภัย
            { username, email, profileImage },
            { new: true, runValidators: true }
        );

        res.json({ msg: "อัปเดตข้อมูลสำเร็จ", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [5. เปลี่ยนรหัสผ่าน - Change Password] ---
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ msg: 'รหัสผ่านใหม่ไม่ตรงกัน' });
        }

        const user = await User.findById(req.user.id).select('+password');
        
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ msg: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });

        user.password = newPassword; // จะถูก hash ใหม่อัตโนมัติใน Model
        await user.save();

        res.json({ msg: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;