import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Register from './pages/Register'; 
import ForgotPassword from './pages/ForgotPassword'; 
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import OwnerDashboard from './pages/OwnerDashboard'; 
import Coupons from './pages/Coupons';
import ProtectedRoute from './components/ProtectedRoute';
import OwnerCouponManager from './components/OwnerCouponManager';
import Checkout from './pages/Checkout'; 
import MyOrders from './pages/MyOrders'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/coupons" element={<Coupons />} />
          
          {/* User Routes (ต้อง Login) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'ShopOwner', 'User']} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

          {/* Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ShopOwner', 'Admin']} />}>
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/manage-coupons" element={<OwnerCouponManager />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;