import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Home, Ticket, PlusCircle, LayoutDashboard, Package } from 'lucide-react';
import { getCart } from '../utils/cartUtils'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // อัปเดตสถานะจาก localStorage
    const currentToken = localStorage.getItem('token');
    const currentRole = localStorage.getItem('role');
    setToken(currentToken);
    setRole(currentRole);
    
    // อัปเดตจำนวนสินค้า (ใส่ try-catch หรือเช็ค Array กันจอขาว)
    try {
      const cart = getCart() || []; // ถ้า getCart ส่ง null ให้ใช้ [] แทน
      const count = Array.isArray(cart) 
        ? cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0) 
        : 0;
      setCartCount(count);
    } catch (error) {
      console.error("Cart error:", error);
      setCartCount(0);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.clear(); // ล้างทั้งหมดเพื่อความชัวร์
    setToken(null);
    setRole(null);
    alert('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-black/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-black italic text-red-600 tracking-tighter uppercase">
          SNEAKER <span className="text-white">HUB</span>
        </Link>
      </div>

      <div className="flex items-center space-x-5">
        <Link title="Home" to="/" className="text-zinc-400 hover:text-white transition">
          <Home size={22} />
        </Link>
        
        <Link
          title={role === 'ShopOwner' ? 'Manage Coupons' : 'Coupons'}
          to={role === 'ShopOwner' ? '/manage-coupons' : '/coupons'}
          className="text-zinc-400 hover:text-white transition"
        >
          <Ticket size={22} />
        </Link>
        
        <div className="relative">
          <Link title="Cart" to="/cart" className="text-zinc-400 hover:text-white transition">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {token ? (
          <div className="flex items-center space-x-4 border-l border-zinc-700 pl-5">
            <Link 
              title="My Orders" 
              to="/my-orders" 
              className={`text-zinc-400 hover:text-red-500 transition flex items-center gap-1 ${location.pathname === '/my-orders' ? 'text-red-600' : ''}`}
            >
              <Package size={22} />
              <span className="hidden md:block text-[11px] font-bold uppercase tracking-wider">Orders</span>
            </Link>

            {/* รองรับทั้ง ShopOwner และ shopowner (เผื่อเคสตัวเล็กใหญ่ใน DB) */}
            {(role?.toLowerCase() === 'shopowner') && (
              <Link 
                to="/owner-dashboard"
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-black text-[11px] uppercase hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-900/20"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:block">Add Product</span>
              </Link>
            )}

            {role === 'Admin' && (
              <Link 
                to="/admin"
                className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-xl font-bold text-[11px] hover:bg-zinc-700 transition"
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:block">ADMIN</span>
              </Link>
            )}
            
            <div className="flex items-center gap-3">
              <Link to="/profile" title="Profile" className="text-red-600 hover:scale-110 transition">
                <User size={24} fill="currentColor" />
              </Link>

              <button 
                title="Logout"
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-500 transition"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        ) : (
          <Link title="Login" to="/login" className="text-zinc-400 hover:text-white transition">
            <User size={22} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;