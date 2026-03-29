import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Home, Ticket, PlusCircle, LayoutDashboard, Package, ShieldCheck } from 'lucide-react';
import { getCart } from '../utils/cartUtils'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    const currentRole = localStorage.getItem('role');
    setToken(currentToken);
    setRole(currentRole);
    
    try {
      const cart = getCart() || [];
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
    localStorage.clear();
    setToken(null);
    setRole(null);
    alert('Logged out successfully');
    navigate('/login');
  };

  // ตรวจสอบว่าเป็น Admin หรือ ShopOwner (Case-insensitive)
  const isAdmin = role?.toLowerCase() === 'admin';
  const isOwner = role?.toLowerCase() === 'shopowner';

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
          title={isOwner || isAdmin ? 'Manage Coupons' : 'Coupons'}
          to={isOwner || isAdmin ? '/admin/coupons' : '/coupons'} // ถ้าเป็น Admin ให้ไปหน้าจัดการ
          className={`transition ${location.pathname.includes('coupon') ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}
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
            
            {/* --- ส่วนของ ADMIN / OWNER เท่านั้น --- */}
            {(isAdmin || isOwner) && (
              <div className="flex items-center space-x-3 bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
                {/* ปุ่มไปหน้าจัดการ Order (หน้าใหม่ที่เราเพิ่งทำ) */}
                <Link 
                  to="/admin/orders" 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/admin/orders' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  <ShieldCheck size={18} />
                  <span className="hidden lg:block text-[10px] font-black uppercase tracking-tighter">Orders Control</span>
                </Link>

                {/* ปุ่มเพิ่มสินค้า */}
                <Link 
                  to="/owner-dashboard"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-1.5 transition-all"
                >
                  <PlusCircle size={18} />
                  <span className="hidden lg:block text-[10px] font-black uppercase tracking-tighter">Products</span>
                </Link>
              </div>
            )}

            {/* --- ส่วนของ USER ทั่วไป --- */}
            {!isAdmin && (
              <Link 
                title="My Orders" 
                to="/my-orders" 
                className={`text-zinc-400 hover:text-red-500 transition flex items-center gap-1 ${location.pathname === '/my-orders' ? 'text-red-600' : ''}`}
              >
                <Package size={22} />
                <span className="hidden md:block text-[11px] font-bold uppercase tracking-wider">My Orders</span>
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