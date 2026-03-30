import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Home, Ticket, PlusCircle, Package, ShieldCheck } from 'lucide-react';
import { getCart } from '../utils/cartUtils'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userName: ''
  });
  
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    const currentRole = localStorage.getItem('role');
    let currentName = 'User';

    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser) {
        currentName = savedUser.name || savedUser.username || 'User';
      }
    } catch (err) {
      console.error("User data parse error:", err);
    }

    setAuthState({
      token: currentToken,
      role: currentRole,
      userName: currentName
    });

    try {
      const cart = getCart() || [];
      const count = Array.isArray(cart) 
        ? cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0) 
        : 0;
      setCartCount(count);
    } catch (error) {
      setCartCount(0);
    }
  }, [location]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      setAuthState({ token: null, role: null, userName: '' });
      navigate('/login');
    }
  };

  // เช็ค Role รองรับทั้ง Admin (ตัวใหญ่) และ admin (ตัวเล็ก)
  const isAdmin = authState.role?.toLowerCase() === 'admin';
  const isOwner = authState.role?.toLowerCase() === 'shopowner';
  const isLoggedIn = !!authState.token;

  return (
    <nav className="flex items-center justify-between p-4 bg-black/95 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-[100] transition-all">
      {/* --- LOGO --- */}
      <div className="flex items-center">
        <Link to="/" className="group flex items-center gap-2 text-2xl font-black italic text-red-600 tracking-tighter uppercase">
          <span className="group-hover:scale-110 transition-transform">SNEAKER</span>
          <span className="text-white">HUB</span>
        </Link>
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <div className="flex items-center space-x-1 md:space-x-5">
        
        <Link 
          title="Home" 
          to="/" 
          className={`p-2 transition-colors ${location.pathname === '/' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}
        >
          <Home size={22} />
        </Link>
        
        <Link
          title={isOwner || isAdmin ? 'Manage Coupons' : 'Coupons'}
          to={isOwner || isAdmin ? '/admin/coupons' : '/coupons'}
          className={`p-2 transition-colors ${location.pathname.includes('coupon') ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}
        >
          <Ticket size={22} />
        </Link>
        
        <div className="relative p-2">
          <Link title="Cart" to="/cart" className={`transition-colors ${location.pathname === '/cart' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white border-2 border-black">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center space-x-3 md:space-x-4 border-l border-zinc-800 pl-4 md:pl-5">
            
            {/* --- ADMIN TOOLS (แก้ไขจุดนี้) --- */}
            {(isAdmin || isOwner) && (
              <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800 shadow-inner">
                <Link 
                  to="/admin/orders" 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/admin/orders' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-200'}`}
                >
                  <ShieldCheck size={18} />
                  <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">Orders</span>
                </Link>

                {/* แก้ไข Path ให้ไปหน้าจัดการสินค้า (AdminProductManager) */}
                <Link 
                  to="/admin/products"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${location.pathname === '/admin/products' ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-200'}`}
                >
                  <Package size={18} />
                  <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">Warehouse</span>
                </Link>
              </div>
            )}

            <Link 
              title="My Orders" 
              to="/my-orders" 
              className={`p-2 transition-colors ${location.pathname === '/my-orders' ? 'text-red-600' : 'text-zinc-400 hover:text-white'}`}
            >
              <Package size={22} />
            </Link>
            
            <div className="flex items-center gap-3 bg-gradient-to-r from-zinc-900 to-black px-4 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-red-600 uppercase leading-none mb-0.5 tracking-[0.1em]">
                  {authState.role}
                </span>
                <span className="text-[11px] font-bold text-white leading-none max-w-[80px] truncate">
                  {authState.userName}
                </span>
              </div>
              
              <Link to="/profile" className="relative transition-transform group-hover:scale-110">
                <User size={24} className="text-zinc-400 group-hover:text-white transition-colors" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full shadow-sm"></div>
              </Link>

              <button 
                onClick={handleLogout}
                className="text-zinc-600 hover:text-red-500 transition-colors ml-1 border-l border-zinc-800 pl-3"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-white hover:text-black text-white rounded-full text-xs font-black uppercase transition-all italic shadow-lg shadow-red-600/20"
          >
            <User size={16} /> Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;