import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { orderService } from '../services';
import { formatDate, formatPrice, orderStatusConfig } from '../utils/helpers';
import { OrderCardSkeleton } from '../components/ui/Skeletons';

export default function OrdersPage() {
  const [params]   = useSearchParams();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [filter,   setFilter]   = useState('');

  useEffect(() => {
    setLoading(true);
    orderService.getMyOrders({ page, limit: 10, status: filter || undefined })
      .then((r) => { setOrders(r.data.data); setTotal(r.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filter]);

  const justPlaced = params.get('success');

  return (
    <div className="page-container py-8">
      {justPlaced && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <CheckCircleIcon className="w-12 h-12 text-green-500 shrink-0" />
          <div>
            <h3 className="font-bold text-green-800 text-lg">Order Placed Successfully! 🎉</h3>
            <p className="text-green-700 text-sm">Thank you for shopping at SareeBazaar. You'll receive a confirmation email shortly.</p>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">My Orders</h1>
        <span className="text-gray-500 text-sm">{total} orders</span>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {[['', 'All'], ['confirmed', 'Confirmed'], ['processing', 'Processing'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']].map(([val, label]) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === val ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📦</p>
          <h3 className="font-serif text-2xl font-bold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-8">When you place your first order, it will appear here</p>
          <Link to="/products" className="btn-primary px-10 py-3.5 inline-block">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = orderStatusConfig[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
            return (
              <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-gray-800">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${cfg.color} text-xs px-2.5 py-1`}>{cfg.label}</span>
                    <p className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-4">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="shrink-0">
                      <img src={item.image || item.product?.images?.[0]?.url || '/placeholder-saree.jpg'} alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TruckIcon className="w-4 h-4" />
                    <span>{order.shipping?.trackingNumber ? `Tracking: ${order.shipping.trackingNumber}` : order.paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="flex gap-2">
                    {order.shipping?.trackingUrl && (
                      <a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer"
                        className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        Track
                      </a>
                    )}
                    <Link to={`/orders/${order._id}`}
                      className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
