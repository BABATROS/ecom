import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// --- User & Auth Pages ---
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Coupons from './pages/Coupons';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register'; 
import ForgotPassword from './pages/ForgotPassword'; 
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Checkout from './pages/Checkout'; 
import MyOrders from './pages/MyOrders'; 

// --- Admin & Owner Pages ---
import OwnerDashboard from './pages/OwnerDashboard'; // ใช้เป็นหน้า "เพิ่มสินค้า"
import AdminOrderList from './pages/AdminOrderList'; 
import AdminCouponManager from './pages/AdminCouponManager'; 
import AdminProductManager from './pages/AdminProductManager'; // หน้า "คลังสินค้า" (จัดการ ลบ/แก้ไข)
import EditProduct from './pages/EditProduct'; // หน้า "แก้ไขรายละเอียด"
import ProtectedRoute from './components/ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-black text-white selection:bg-red-600 font-sans antialiased">
        <Navbar />
        <main className="relative z-10">
          <Routes>
            {/* 🏠 Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            
            {/* 👤 User Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'admin', 'ShopOwner', 'shopowner', 'User', 'user']} />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>

            {/* ⚡ Management Hub (แยกแท็บชัดเจน) */}
            <Route element={<ProtectedRoute allowedRoles={['ShopOwner', 'shopowner', 'Admin', 'admin']} />}>
              
              {/* TAB 1: หน้าเพิ่มสินค้า (ใช้ OwnerDashboard เดิมที่คุณมีฟอร์มอยู่แล้ว) */}
              <Route path="/admin/add-product" element={<OwnerDashboard />} />
              
              {/* TAB 2: หน้าคลังสินค้า (สำหรับดูทั้งหมด และกดปุ่ม Edit/Delete) */}
              <Route path="/admin/products" element={<AdminProductManager />} />
              
              {/* TAB 3: หน้าแก้ไขข้อมูล (ตัวที่รับ ID เข้าไป) */}
              <Route path="/admin/edit-product/:id" element={<EditProduct />} />
              
              {/* TAB 4: จัดการออเดอร์และคูปอง */}
              <Route path="/admin/orders" element={<AdminOrderList />} />
              <Route path="/admin/coupons" element={<AdminCouponManager />} />

              {/* Default Admin Path: ใครกดเข้า /owner-dashboard ให้ส่งไปหน้าคลังสินค้าเลย */}
              <Route path="/owner-dashboard" element={<Navigate to="/admin/products" replace />} />
            </Route>

            {/* 🚫 404 Page */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[90vh] text-center">
                <h1 className="text-[10rem] font-black italic text-zinc-900 tracking-tighter">404</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest -mt-10 mb-12">Engine Error: Path Not Found</p>
                <button onClick={() => window.location.href = '/'} className="bg-red-600 text-white px-10 py-4 rounded-full font-black italic uppercase">
                  Back Home
                </button>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;