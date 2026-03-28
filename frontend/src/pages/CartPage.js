import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MinusIcon, PlusIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { removeFromCart, updateCartItem, applyCoupon, selectCartItems, selectCartSubtotal } from '../features/cart/cartSlice';
import { formatPrice } from '../utils/helpers';

export default function CartPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const items     = useSelector(selectCartItems);
  const subtotal  = useSelector(selectCartSubtotal);
  const { couponCode, couponDiscount } = useSelector((s) => s.cart);
  const [coupon,  setCoupon]  = useState('');
  const [applying,setApplying]= useState(false);

  const shipping = subtotal >= 999 ? 0 : 99;
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + shipping + tax - couponDiscount;

  const handleApply = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    await dispatch(applyCoupon(coupon));
    setApplying(false);
  };

  if (items.length === 0) return (
    <div className="page-container py-20 text-center">
      <p className="text-7xl mb-6">🛒</p>
      <h2 className="font-serif text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
      <p className="text-gray-500 mb-8">Explore our beautiful collection of sarees and add them to your cart</p>
      <Link to="/products" className="btn-primary text-base px-10 py-4 inline-block">Browse Sarees</Link>
    </div>
  );

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8">Shopping Cart <span className="text-gray-400 font-normal text-lg">({items.reduce((s,i)=>s+i.quantity,0)} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}
                className="card p-4 flex gap-4">
                <Link to={`/products/${item.product?.slug}`}>
                  <img src={item.product?.images?.[0]?.url || '/placeholder-saree.jpg'} alt={item.name}
                    className="w-24 h-28 object-cover rounded-xl bg-gray-100 shrink-0" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="flex-1">
                      <Link to={`/products/${item.product?.slug}`}
                        className="font-medium text-gray-800 hover:text-primary-600 transition-colors line-clamp-2">
                        {item.product?.name || item.name}
                      </Link>
                      {item.color && <p className="text-xs text-gray-500 mt-1">Color: {item.color}</p>}
                      {item.product?.attributes?.fabric && (
                        <p className="text-xs text-gray-500">Fabric: {item.product.attributes.fabric}</p>
                      )}
                    </div>
                    <button onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0 h-fit">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                        disabled={item.quantity <= 1}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold text-gray-800 border-x border-gray-200">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors">
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{couponCode}</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">-{formatPrice(couponDiscount)}</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code" className="input-field flex-1 text-sm py-2.5" />
                  <button onClick={handleApply} disabled={applying || !coupon}
                    className="btn-secondary text-sm py-2.5 px-4 whitespace-nowrap">
                    {applying ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>{formatPrice(tax)}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-{formatPrice(couponDiscount)}</span></div>
              )}
              {shipping > 0 && (
                <p className="text-xs text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                  Add {formatPrice(999 - subtotal)} more for FREE shipping!
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>

            <button onClick={() => navigate(user ? '/checkout' : '/login?redirect=/checkout')}
              className="btn-primary w-full py-4 text-base mt-5">
              Proceed to Checkout →
            </button>

            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-primary-600 mt-3 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
