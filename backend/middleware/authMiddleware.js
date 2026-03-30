const jwt = require('jsonwebtoken');

// ใช้ชื่อ protect เพื่อให้ตรงกับที่ไฟล์ routes/auth.js และ routes/product.js เรียกใช้
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
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

// สำหรับเช็คว่าเป็น Admin หรือไม่
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json("สิทธิ์ของคุณไม่เพียงพอ (Admin Only)");
    }
};

// สำหรับเช็คว่าเป็น Seller หรือ Admin (ใช้ในหน้าจัดการสินค้า)
const sellerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'seller')) {
        next();
    } else {
        res.status(403).json("เฉพาะผู้ขายหรือแอดมินเท่านั้น");
    }
};

module.exports = { protect, isAdmin, sellerOrAdmin };