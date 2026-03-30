const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ msg: "Token หมดอายุ กรุณา Login ใหม่" });
            req.user = decoded; 
            next();
        });
    } else {
        return res.status(401).json({ msg: "กรุณา Login ก่อน" });
    }
};

const sellerOrAdmin = (req, res, next) => {
    const role = req.user?.role?.toLowerCase();
    const allowed = ['admin', 'seller', 'merchant', 'shopowner']; // ✅ ปลดล็อกให้เข้าได้หมด
    if (role && allowed.includes(role)) {
        next();
    } else {
        res.status(403).json({ msg: `สิทธิ์ '${role}' ไม่สามารถเข้าหน้านี้ได้` });
    }
};

module.exports = { protect, sellerOrAdmin };