const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');

// --- Register ---
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;
        if (password !== confirmPassword) return res.status(400).json({ msg: 'รหัสผ่านไม่ตรงกัน' });
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้งานแล้ว' });
        user = new User({ username, email, password, role: role || 'user' });
        await user.save();
        res.status(201).json({ msg: 'ลงทะเบียนสำเร็จ!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Login ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Update Profile (บรรทัดที่เคยพัง) ---
router.put('/update-profile', protect, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true });
        res.json({ msg: "อัปเดตข้อมูลสำเร็จ", user: updatedUser });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;