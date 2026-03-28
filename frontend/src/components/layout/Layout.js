import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import SearchOverlay from '../search/SearchOverlay';
import { fetchMe } from '../../features/auth/authSlice';
import { fetchCart } from '../../features/cart/cartSlice';
import { fetchWishlist } from '../../features/wishlist/wishlistSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(fetchMe());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <SearchOverlay />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
