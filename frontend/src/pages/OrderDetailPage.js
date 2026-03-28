import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { orderService } from '../services';
import { formatDate, formatPrice, orderStatusConfig, paymentStatusConfig } from '../utils/helpers';

const STATUS_STEPS = ['placed','confirmed','processing','shipped','out_for_delivery','delivered'];

export default function OrderDetailPage() {
  const { id }    = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(id).then((r) => setOrder(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container py-10 animate-pulse space-y-4"><div className="bg-white rounded-2xl h-40" /><div className="bg-white rounded-2xl h-60" /></div>;
  if (!order)  return <div className="page-container py-20 text-center text-gray-400">Order not found</div>;

  const statusIdx = STATUS_STEPS.indexOf(order.status);
  const cfg = orderStatusConfig[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
  const payCfg = paymentStatusConfig[order.paymentStatus] || { label: order.paymentStatus, color: 'bg-gray-100 text-gray-700' };

  return (
    <div className="page-container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="section-title">Order #{order.orderNumber}</h1>
          <p className="text-gray-400 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${cfg.color} text-sm px-3 py-1.5`}>{cfg.label}</span>
          <span className={`badge ${payCfg.color} text-sm px-3 py-1.5`}>{payCfg.label}</span>
        </div>
      </div>

      {/* Progress tracker */}
      {!['cancelled','returned','refunded'].includes(order.status) && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-5">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => {
              const done   = i <= statusIdx;
              const active = i === statusIdx;
              const cfg2   = orderStatusConfig[s];
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'} ${active ? 'ring-4 ring-primary-200' : ''}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center w-16 leading-tight ${active ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>{cfg2?.label || s}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded transition-all ${i < statusIdx ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {order.shipping?.trackingNumber && (
            <div className="mt-5 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <TruckIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Tracking: {order.shipping.trackingNumber}</p>
                {order.shipping.trackingUrl && (
                  <a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Track your package →</a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Items ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <img src={item.image || item.product?.images?.[0]?.url || '/placeholder-saree.jpg'}
                    alt={item.name} className="w-20 h-24 object-cover rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.color && <p className="text-xs text-gray-500 mt-0.5">Color: {item.color}</p>}
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel option */}
          {['placed','confirmed'].includes(order.status) && (
            <button onClick={async () => {
              const reason = prompt('Reason for cancellation:');
              if (!reason) return;
              await orderService.cancel(order._id, reason);
              window.location.reload();
            }} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
              <ArrowPathIcon className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5 text-sm space-y-2">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-100 pt-2">
              <span>Total</span><span className="text-primary-600">{formatPrice(order.totalAmount)}</span>
            </div>
            <p className="text-xs text-gray-400">Payment: {order.paymentMethod?.toUpperCase()}</p>
          </div>

          <div className="card p-5 text-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Delivery Address</h3>
            <div className="text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p>📞 {order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
