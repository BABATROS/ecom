import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import OwnerDashboard from './pages/OwnerDashboard'; 
import AdminOrderList from './pages/AdminOrderList'; // หน้าเช็คสลิป/ออเดอร์
import AdminProductManager from './pages/AdminProductManager'; // หน้าจัดการสต็อก
import AdminCouponManager from './pages/AdminCouponManager'; // หน้าจัดการคูปอง
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white font-sans">
        <Navbar />
        <Routes>
          {/* 🏠 Public Routes (ใครก็เข้าได้) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* 👤 User Routes (ต้อง Login) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'ShopOwner', 'User']} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

          {/* ⚡ Owner & Admin Management Routes (หลังบ้าน) */}
          <Route element={<ProtectedRoute allowedRoles={['ShopOwner', 'Admin']} />}>
            {/* หน้าหลักสำหรับลงสินค้า */}
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            
            {/* ระบบจัดการคูปอง (ใส่ไว้ทั้ง 2 path เพื่อความปลอดภัย) */}
            <Route path="/admin/coupons" element={<AdminCouponManager />} />
            <Route path="/manage-coupons" element={<AdminCouponManager />} />

            {/* ระบบจัดการออเดอร์และเช็คสลิป */}
            <Route path="/admin/orders" element={<AdminOrderList />} />
            
            {/* ระบบจัดการคลังสินค้า */}
            <Route path="/admin/products" element={<AdminProductManager />} />
          </Route>

          {/* 🚫 404 Page */}
          <Route path="*" element={
            <div className="text-white flex flex-col items-center justify-center h-[80vh]">
              <h1 className="text-8xl font-black italic text-red-600 tracking-tighter">404</h1>
              <div className="bg-red-600 px-4 py-1 skew-x-[-12deg] mb-4">
                <p className="text-white font-black uppercase text-sm skew-x-[12deg]">Sneaker Not Found</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;