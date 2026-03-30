const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json("Token ไม่ถูกต้อง!");
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("คุณยังไม่ได้ Login!");
    }
};

const isAdmin = (req, res, next) => {
    // เช็ค role ว่าเป็น admin (ตัวเล็ก) ตามที่คุณแก้ใน Compass ไหม
    if (req.user && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json("สิทธิ์ของคุณไม่เพียงพอ (Admin Only)");
    }
};

module.exports = { verifyToken, isAdmin };