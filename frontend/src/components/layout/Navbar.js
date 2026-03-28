import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCartIcon, HeartIcon, UserIcon, MagnifyingGlassIcon,
  Bars3Icon, XMarkIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../features/auth/authSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { openCartDrawer, toggleMobileMenu, toggleSearch } from '../../features/ui/uiSlice';
import { categoryService } from '../../services';

export default function Navbar() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { user }    = useSelector((s) => s.auth);
  const cartCount   = useSelector(selectCartCount);
  const { mobileMenuOpen } = useSelector((s) => s.ui);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);

  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled]     = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    categoryService.getTree().then((r) => setCategories(r.data.data)).catch(() => {});
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white border-b border-gray-100'}`}>
      {/* Top bar */}
      <div className="bg-primary-500 text-white text-center py-1.5 text-xs font-medium tracking-wide">
        🎉 Free shipping on orders above ₹999 | Use code FIRST10 for 10% off your first order
      </div>

      {/* Main nav */}
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🪡</span>
            <div>
              <span className="font-serif text-xl font-bold text-primary-600">Saree</span>
              <span className="font-serif text-xl font-bold text-gold-600">Bazaar</span>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <button
              onClick={() => dispatch(toggleSearch())}
              className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200 rounded-full px-5 py-2.5 text-gray-500 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span className="text-sm">Search sarees, fabrics, occasions...</span>
            </button>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={() => dispatch(toggleSearch())} className="md:hidden p-2 rounded-full hover:bg-gray-100">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" />
            </button>

            <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-gray-100">
              <HeartIcon className="w-6 h-6 text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button onClick={() => dispatch(openCartDrawer())} className="relative p-2 rounded-full hover:bg-gray-100">
              <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative" onMouseEnter={() => setActiveDropdown('user')} onMouseLeave={() => setActiveDropdown(null)}>
              <button className="flex items-center gap-1.5 p-2 rounded-full hover:bg-gray-100">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-700" />
                )}
                {user && <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name.split(' ')[0]}</span>}
              </button>

              <AnimatePresence>
                {activeDropdown === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                        <Link to="/orders" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                        <Link to="/wishlist" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                        {user.role === 'vendor' && (
                          <Link to="/vendor/dashboard" className="flex items-center px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 font-medium">Vendor Dashboard</Link>
                        )}
                        {user.role === 'admin' && (
                          <Link to="/admin/dashboard" className="flex items-center px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 font-medium">Admin Panel</Link>
                        )}
                        <hr className="my-1" />
                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">Logout</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="flex items-center px-4 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50">Login</Link>
                        <Link to="/register" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Register</Link>
                        <hr className="my-1" />
                        <Link to="/register?role=vendor" className="flex items-center px-4 py-2.5 text-sm text-gold-600 hover:bg-gold-50">Sell on SareeBazaar</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="md:hidden p-2" onClick={() => dispatch(toggleMobileMenu())}>
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Categories bar */}
        <nav className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          <Link to="/products" className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-full whitespace-nowrap transition-colors">
            All Sarees
          </Link>
          {categories.slice(0, 8).map((cat) => (
            <div key={cat._id} className="relative group">
              <Link
                to={`/category/${cat.slug}`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-full whitespace-nowrap transition-colors"
              >
                {cat.name}
                {cat.children?.length > 0 && <ChevronDownIcon className="w-3.5 h-3.5" />}
              </Link>
              {cat.children?.length > 0 && (
                <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-40">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[180px]">
                    {cat.children.map((sub) => (
                      <Link key={sub._id} to={`/category/${sub.slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link to="/products?isTrending=true" className="px-3 py-1.5 text-sm font-medium text-gold-600 hover:bg-gold-50 rounded-full whitespace-nowrap transition-colors">
            🔥 Trending
          </Link>
          <Link to="/products?isFeatured=true" className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-full whitespace-nowrap transition-colors">
            ⭐ Featured
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <nav className="page-container py-4 space-y-1">
              <Link to="/products" className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-50">All Sarees</Link>
              {categories.map((cat) => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-50">{cat.name}</Link>
              ))}
              {!user && (
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <Link to="/login" className="btn-primary text-sm py-2 flex-1 text-center">Login</Link>
                  <Link to="/register" className="btn-secondary text-sm py-2 flex-1 text-center">Register</Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
