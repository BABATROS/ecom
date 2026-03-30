import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  // ดึง Role และล้างช่องว่าง (Trim) พร้อมทำเป็นตัวเล็ก
  const rawRole = localStorage.getItem('role');
  const role = rawRole ? rawRole.trim().toLowerCase() : null;

  // 1. ถ้าไม่มี Token (ไม่ได้ Login)
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ตรวจสอบสิทธิ์
  // ปรับ allowedRoles ให้เป็นตัวเล็กทั้งหมดก่อนเอามาเทียบ
  const normalizedAllowedRoles = allowedRoles.map(r => r.trim().toLowerCase());
  
  const isAllowed = allowedRoles.length === 0 || normalizedAllowedRoles.includes(role);

  if (isAllowed) {
    return <Outlet />;
  }

  // 3. Login แล้วแต่สิทธิ์ไม่ถึง
  console.warn(`[Access Denied] Current Role: "${role}", Required: [${normalizedAllowedRoles}]`);
  
  // ถ้าสิทธิ์ไม่ถึง ให้เด้งไปหน้าแรก
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;