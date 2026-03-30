const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้ไปแล้ว' });

        user = new User({ username, email, password, role: role || 'user' });
        await user.save();
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านผิด' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, role: user.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;