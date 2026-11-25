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
import { openCartDrawer, toggleMobileMenu, toggleSearchOverlay } from '../../features/ui/uiSlice';
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
    <header className={`sticky top-0 z-50 bg-ivory/95 backdrop-blur transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''} border-b border-gray-200`}>
      {/* Top bar */}
      <div className={`bg-ink text-ivory/80 text-center text-[10px] font-medium uppercase tracking-[0.3em] overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0 py-0' : 'max-h-12 py-2.5'}`}>
        Complimentary shipping on orders above ₹999
      </div>

      {/* Main nav */}
      <div className="page-container">
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center h-16 transition-all duration-300 ${scrolled ? 'md:h-16' : 'md:h-24'}`}>
          {/* Search - desktop */}
          <div className="hidden md:flex">
            <button
              onClick={() => dispatch(toggleSearchOverlay())}
              className="flex items-center gap-3 text-gray-600 hover:text-ink transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" strokeWidth={1.25} />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em]">Search</span>
            </button>
          </div>
          <div className="md:hidden flex items-center -ml-2">
            <button className="p-2" aria-label="Menu" onClick={() => dispatch(toggleMobileMenu())}>
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" strokeWidth={1.25} /> : <Bars3Icon className="w-6 h-6" strokeWidth={1.25} />}
            </button>
            <button onClick={() => dispatch(toggleSearchOverlay())} aria-label="Search" className="p-2">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" strokeWidth={1.25} />
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="justify-self-center text-center shrink-0">
            <span className="block font-serif text-lg sm:text-2xl md:text-[2rem] font-medium uppercase tracking-[0.2em] sm:tracking-[0.32em] text-ink leading-none pl-[0.2em] sm:pl-[0.32em]">
              Saree<span className="text-gold-600">Bazaar</span>
            </span>
            <span className={`mt-2 text-[9px] font-medium uppercase tracking-[0.42em] text-gray-500 pl-[0.42em] ${scrolled ? 'hidden' : 'hidden md:block'}`}>
              Heritage Weaves &amp; Couture
            </span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center justify-self-end gap-0 md:gap-3 -mr-2 md:mr-0">
            <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 hidden md:block">
              <HeartIcon className="w-6 h-6 text-gray-700 hover:text-ink transition-colors" strokeWidth={1.25} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-ink text-ivory text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button onClick={() => dispatch(openCartDrawer())} className="relative p-2">
              <ShoppingCartIcon className="w-6 h-6 text-gray-700 hover:text-ink transition-colors" strokeWidth={1.25} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-ink text-ivory text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative" onMouseEnter={() => setActiveDropdown('user')} onMouseLeave={() => setActiveDropdown(null)}>
              <button className="flex items-center gap-1.5 p-2" aria-label="Account" onClick={() => setActiveDropdown((d) => (d === 'user' ? null : 'user'))}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-700 hover:text-ink transition-colors" strokeWidth={1.25} />
                )}
                {user && <span className="hidden lg:block text-[11px] font-medium uppercase tracking-[0.18em] text-gray-700 max-w-[90px] truncate">{user.name.split(' ')[0]}</span>}
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
          </div>
        </div>

        {/* Categories bar */}
        <nav className="hidden md:block pb-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-6 lg:gap-10 w-max mx-auto">
          <Link to="/products" className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-700 hover:text-ink whitespace-nowrap transition-colors">
            All Collections
          </Link>
          {categories.slice(0, 6).map((cat) => (
            <div key={cat._id} className="relative group">
              <Link
                to={`/category/${cat.slug}`}
                className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.22em] text-gray-700 hover:text-ink whitespace-nowrap transition-colors"
              >
                {cat.name.replace(/\s*Sarees$/i, '')}
                {cat.children?.length > 0 && <ChevronDownIcon className="w-3 h-3" />}
              </Link>
              {cat.children?.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 hidden group-hover:block z-40">
                  <div className="bg-ivory border border-gray-200 shadow-xl py-3 min-w-[200px]">
                    {cat.children.map((sub) => (
                      <Link key={sub._id} to={`/category/${sub.slug}`} className="block px-6 py-2 text-xs uppercase tracking-[0.18em] text-gray-700 hover:text-ink hover:bg-ethnic-cream">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link to="/products?isTrending=true" className="hidden lg:block text-[11px] font-medium uppercase tracking-[0.22em] text-gold-600 hover:text-gold-700 whitespace-nowrap transition-colors">
            Trending
          </Link>
          <Link to="/products?isFeatured=true" className="hidden lg:block text-[11px] font-medium uppercase tracking-[0.22em] text-primary-600 hover:text-primary-700 whitespace-nowrap transition-colors">
            Featured
          </Link>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-200 bg-ivory overflow-hidden"
          >
            <nav className="page-container py-4 space-y-1">
              <Link to="/products" className="block px-3 py-2.5 text-xs font-medium uppercase tracking-[0.2em] hover:bg-ethnic-cream">All Collections</Link>
              {categories.map((cat) => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="block px-3 py-2.5 text-xs font-medium uppercase tracking-[0.2em] hover:bg-ethnic-cream">{cat.name.replace(/\s*Sarees$/i, '')}</Link>
              ))}
              <Link to="/wishlist" className="block px-3 py-2.5 text-xs font-medium uppercase tracking-[0.2em] hover:bg-ethnic-cream">Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Link>
              {!user && (
                <div className="pt-4 border-t border-gray-200 flex gap-3">
                  <Link to="/login" className="btn-primary !px-4 !py-3 flex-1 text-center">Login</Link>
                  <Link to="/register" className="btn-secondary !px-4 !py-3 flex-1 text-center">Register</Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
