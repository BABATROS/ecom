import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// --- User & Auth Pages ---
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Coupons from './pages/Coupons';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';

// --- Admin & Owner Pages ---
import OwnerDashboard from './pages/OwnerDashboard';
import AdminOrderList from './pages/AdminOrderList';
import AdminProductManager from './pages/AdminProductManager';
import AdminCouponManager from './pages/AdminCouponManager';

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen text-white font-sans">
        <Navbar /> 
        
        <Routes>
          {/* 🏠 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          
          {/* 👤 Private User Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-orders" element={<MyOrders />} />

          {/* ⚡ Admin & Owner Management Routes */}
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          
          {/* จัดกลุ่ม Admin Routes */}
          <Route path="/admin/coupons" element={<AdminCouponManager />} />
          <Route path="/manage-coupons" element={<AdminCouponManager />} />
          <Route path="/admin/orders" element={<AdminOrderList />} />
          <Route path="/admin/products" element={<AdminProductManager />} />

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