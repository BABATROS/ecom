const jwt = require('jsonwebtoken');

/**
 * ✅ Middleware สำหรับตรวจสอบความถูกต้องของ Token
 */
const protect = (req, res, next) => {
  try {
    let token;

    // 1. ตรวจสอบ Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ msg: "กรุณาเข้าสู่ระบบ (No Token Found)" });
    }

    // 2. ตรวจสอบ Secret Key
    if (!process.env.JWT_SECRET) {
      console.error("❌ [Critical] JWT_SECRET is missing in environment variables!");
      return res.status(500).json({ msg: "Server Configuration Error" });
    }

    // 3. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ดึง Payload ออกมา (รองรับทั้งแบบ { user: {...} } และแบบกระจายฟิลด์)
    const userPayload = decoded.user || decoded; 
    
    const userId = userPayload.id || userPayload._id;
    const userRole = userPayload.role ? userPayload.role.toLowerCase() : 'user';

    if (!userId) {
      console.error("❌ [Auth Error] Token missing User ID:", decoded);
      return res.status(401).json({ msg: "Token ไม่สมบูรณ์ กรุณาล็อกอินใหม่" });
    }

    // 4. ฝังข้อมูลผู้ใช้ลงใน request object
    // ปรับให้ role ตรงกับระบบ Frontend (User, ShopOwner, Admin)
    req.user = {
      id: userId.toString(),
      role: userRole === 'seller' ? 'shopowner' : userRole // แมพค่าให้ตรงกัน
    };

    console.log(`✅ [Auth Pass] ID: ${req.user.id} | Role: ${req.user.role}`);
    next();
  } catch (err) {
    console.error("❌ [Auth Error] Invalid Token:", err.message);
    
    const errorMsg = err.name === 'TokenExpiredError' 
      ? "เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่" 
      : "Token ไม่ถูกต้องหรือถูกแก้ไข";
      
    res.status(401).json({ msg: errorMsg });
  }
};

/**
 * ✅ Middleware สำหรับ ShopOwner หรือ Admin เท่านั้น
 */
const sellerOrAdmin = (req, res, next) => {
  // เช็คทั้ง 'shopowner', 'seller' (เผื่อเก่า) และ 'admin'
  const allowedRoles = ['shopowner', 'seller', 'admin'];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    console.warn(`🚫 [Access Denied] User: ${req.user?.id} tried to access Owner Area with Role: ${req.user?.role}`);
    res.status(403).json({ msg: "สิทธิ์ไม่เพียงพอ (จำกัดเฉพาะเจ้าของร้านหรือแอดมิน)" });
  }
};

/**
 * ✅ Middleware สำหรับ Admin เท่านั้น
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.warn(`🚫 [Access Denied] Non-Admin Access Attempt: ${req.user?.id}`);
    res.status(403).json({ msg: "จำกัดสิทธิ์เฉพาะผู้ดูแลระบบ (Admin Only)" });
  }
};

module.exports = { protect, adminOnly, sellerOrAdmin };