import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChartBarIcon, ShoppingBagIcon, CubeIcon, CogIcon,
  DocumentTextIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon,
  HomeIcon, BellIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../../features/auth/authSlice';

const NAV = [
  { to: '/vendor/dashboard',  label: 'Dashboard',  icon: ChartBarIcon },
  { to: '/vendor/products',   label: 'Products',   icon: CubeIcon },
  { to: '/vendor/orders',     label: 'Orders',     icon: ShoppingBagIcon },
  { to: '/vendor/analytics',  label: 'Analytics',  icon: ChartBarIcon },
  { to: '/vendor/kyc',        label: 'KYC',        icon: DocumentTextIcon },
  { to: '/vendor/settings',   label: 'Settings',   icon: CogIcon },
];

export default function VendorLayout() {
  const { pathname } = useLocation();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const { user }     = useSelector((s) => s.auth);
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-gray-900 text-white ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2 mb-1">
          <span className="text-xl">🪡</span>
          <span className="font-serif font-bold text-lg"><span className="text-primary-400">Saree</span><span className="text-gold-400">Bazaar</span></span>
        </Link>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Vendor Panel</span>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center font-bold">{user?.name?.[0]}</div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (pathname.startsWith(to) && to !== '/vendor/dashboard');
          return (
            <Link key={to} to={to} onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
          <HomeIcon className="w-5 h-5" /> Back to Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/30 transition-all">
          <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0"><Sidebar /></div>

      {/* Mobile sidebar */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSideOpen(false)} />
          <div className="relative z-10"><Sidebar mobile /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSideOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
            </button>
            <Link to="/vendor/products/add" className="btn-primary text-sm py-2 px-4 hidden sm:block">+ Add Product</Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
