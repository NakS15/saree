import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChartBarIcon, UsersIcon, BuildingStorefrontIcon, CubeIcon,
  ShoppingBagIcon, TagIcon, FolderIcon, HomeIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../../features/auth/authSlice';

const NAV = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: ChartBarIcon },
  { to: '/admin/users',      label: 'Users',      icon: UsersIcon },
  { to: '/admin/vendors',    label: 'Vendors',    icon: BuildingStorefrontIcon },
  { to: '/admin/products',   label: 'Products',   icon: CubeIcon },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingBagIcon },
  { to: '/admin/categories', label: 'Categories', icon: FolderIcon },
  { to: '/admin/coupons',    label: 'Coupons',    icon: TagIcon },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const { user }     = useSelector((s) => s.auth);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-gray-950 text-white shrink-0">
        <div className="px-6 py-5 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🪡</span>
            <span className="font-serif font-bold"><span className="text-primary-400">Saree</span><span className="text-gold-400">Bazaar</span></span>
          </Link>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1 block">Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <div className="px-3 py-2 text-xs text-gray-500">Signed in as <span className="text-gray-300">{user?.name}</span></div>
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <HomeIcon className="w-5 h-5" /> View Store
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/30 transition-all">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-800 capitalize">
            {NAV.find((n) => pathname.startsWith(n.to))?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
