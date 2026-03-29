const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// --- [1. สมัครสมาชิก - Register] ---
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;
        if (!username || !email || !password) return res.status(400).json({ msg: 'กรุณากรอกข้อมูลให้ครบ' });
        if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ msg: 'รหัสผ่านไม่ตรงกัน' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้งานแล้ว' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ 
            username, 
            email, 
            password: hashedPassword,
            role: role || 'User' 
        });

        await user.save();
        res.status(201).json({ msg: 'ลงทะเบียนสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [2. เข้าสู่ระบบ - Login] ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'ไม่พบผู้ใช้นี้' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'รหัสผ่านไม่ถูกต้อง' });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            role: user.role,
            user: { id: user._id, username: user.username, email: user.email, role: user.role, profileImage: user.profileImage }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [3. ลืมรหัสผ่าน - Forgot Password] ---
// ในขั้นตอนนี้ปกติจะส่ง Email แต่เบื้องต้นจะเช็คว่ามี User ไหมก่อน
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "ไม่พบอีเมลนี้ในระบบ" });

        // ในอนาคต: สร้าง Token ส่งไปทาง Email
        res.json({ msg: "ระบบตรวจสอบอีเมลเรียบร้อยแล้ว (ขั้นตอนถัดไปคือการส่งลิงก์รีเซ็ต)" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [4. รีเซ็ตรหัสผ่านใหม่ - Reset Password] ---
router.post('/reset-password/:id', async (req, res) => {
    try {
        const { newPassword } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
        res.json({ msg: "เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [5. แก้ไขข้อมูลส่วนตัว - Update Profile] ---
router.put('/update-profile/:id', async (req, res) => {
    try {
        const { username, email, profileImage } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, profileImage },
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ msg: 'ไม่พบผู้ใช้งาน' });
        res.json({ msg: "แก้ไขข้อมูลสำเร็จ", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- [6. เปลี่ยนรหัสผ่าน - Change Password] ---
router.put('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword, confirmPassword } = req.body;
        if (!userId || !currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ msg: 'กรุณากรอกข้อมูลให้ครบ' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ msg: 'รหัสผ่านใหม่ไม่ตรงกัน' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'ไม่พบผู้ใช้งาน' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        res.json({ msg: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;