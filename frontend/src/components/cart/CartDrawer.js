import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon, TrashIcon, ShoppingBagIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { closeCartDrawer } from '../../features/ui/uiSlice';
import { removeFromCart, updateCartItem, selectCartItems, selectCartSubtotal } from '../../features/cart/cartSlice';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { formatPrice } from '../../utils/helpers';

export default function CartDrawer() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { cartDrawerOpen } = useSelector((s) => s.ui);
  const { user }  = useSelector((s) => s.auth);
  const items     = useSelector(selectCartItems);
  const subtotal  = useSelector(selectCartSubtotal);
  const { couponDiscount } = useSelector((s) => s.cart);

  const handleCheckout = () => {
    dispatch(closeCartDrawer());
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => dispatch(closeCartDrawer())}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6 text-primary-600" />
                <h2 className="font-serif text-xl font-bold text-gray-900">My Cart</h2>
                {items.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                )}
              </div>
              <button onClick={() => dispatch(closeCartDrawer())} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <ShoppingBagIcon className="w-16 h-16 text-gray-200 mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                  <p className="text-gray-400 text-sm mb-6">Add beautiful sarees to your cart and start shopping!</p>
                  <button onClick={() => { dispatch(closeCartDrawer()); navigate('/products'); }}
                    className="btn-primary">Browse Sarees</button>
                </div>
              ) : (
                <div className="space-y-4 px-5">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div key={item._id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 bg-gray-50 rounded-xl p-3">
                        <Link to={`/products/${item.product?.slug}`} onClick={() => dispatch(closeCartDrawer())}>
                          <LazyLoadImage
                            src={item.product?.images?.[0]?.url || '/placeholder-saree.jpg'}
                            alt={item.product?.name || item.name}
                            className="w-20 h-24 object-cover rounded-lg bg-gray-200 shrink-0"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.product?.slug}`} onClick={() => dispatch(closeCartDrawer())}>
                            <h4 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2 hover:text-primary-600 transition-colors">
                              {item.product?.name || item.name}
                            </h4>
                          </Link>
                          {item.color && <p className="text-xs text-gray-500 mt-1">Color: {item.color}</p>}
                          <p className="text-primary-600 font-bold mt-1">{formatPrice(item.price)}</p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg">
                              <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                                disabled={item.quantity <= 1}
                                className="p-1.5 hover:bg-gray-100 rounded-l-lg disabled:opacity-40 transition-colors">
                                <MinusIcon className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                              <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                                className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors">
                                <PlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button onClick={() => dispatch(removeFromCart(item._id))}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-5 space-y-4 bg-white">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span><span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Shipping & taxes calculated at checkout</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Estimated Total</span>
                    <span className="text-primary-600">{formatPrice(subtotal - couponDiscount)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} className="btn-primary w-full text-base py-3.5">
                  Proceed to Checkout →
                </button>
                <button onClick={() => { dispatch(closeCartDrawer()); navigate('/cart'); }}
                  className="w-full text-center text-sm text-gray-500 hover:text-primary-600 transition-colors">
                  View full cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
