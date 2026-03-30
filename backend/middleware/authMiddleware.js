const jwt = require('jsonwebtoken');

// ด่านที่ 1: เช็กว่า Login เข้ามาหรือยัง (ตรวจสอบ Token)
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        
        try {
            // ถอดรหัส Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // เก็บข้อมูล User (เช่น id, role) ไว้ใช้ต่อใน Route
            next();
        } catch (err) {
            // ดัก Error กรณี Token หมดอายุ หรือถูกปลอมแปลง
            return res.status(403).json({ msg: "Token ไม่ถูกต้อง หรือหมดอายุ กรุณา Login ใหม่" });
        }
    } else {
        return res.status(401).json({ msg: "กรุณา Login ก่อนเข้าใช้งาน" });
    }
};

// ด่านที่ 2.1: สำหรับเจ้าของร้านและแอดมิน (จัดการสินค้า, ดูคำสั่งซื้อ)
const sellerOrAdmin = (req, res, next) => {
    const role = req.user?.role?.toLowerCase();
    const allowed = ['admin', 'owner', 'seller', 'shopowner']; // ✅ ปรับให้ครอบคลุม
    
    if (role && allowed.includes(role)) {
        next();
    } else {
        res.status(403).json({ msg: `สิทธิ์ '${role || 'ไม่ระบุ'}' ไม่สามารถเข้าหน้านี้ได้` });
    }
};

// ✅ เพิ่มใหม่ ด่านที่ 2.2: สำหรับ Admin เท่านั้น! (จัดการ User, ตั้งค่าระบบ)
const adminOnly = (req, res, next) => {
    const role = req.user?.role?.toLowerCase();
    
    if (role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: "ระดับ Admin เท่านั้นถึงจะเข้าจัดการส่วนนี้ได้!" });
    }
};

module.exports = { protect, sellerOrAdmin, adminOnly };