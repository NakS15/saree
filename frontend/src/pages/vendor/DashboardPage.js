import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon, CubeIcon, ShoppingBagIcon, UsersIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { orderService } from '../../services';
import { formatPrice, formatDate, orderStatusConfig } from '../../utils/helpers';

function StatCard({ title, value, change, icon: Icon, color }) {
  const positive = change >= 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
              {positive ? <ArrowUpIcon className="w-3.5 h-3.5" /> : <ArrowDownIcon className="w-3.5 h-3.5" />}
              {Math.abs(change)}% vs last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAnalytics({ period: 30 })
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 shadow-sm" />)}
      </div>
    </div>
  );

  const { vendor, revenueStats, orderStats, topProducts } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Good Morning! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <Link to="/vendor/products/add" className="btn-primary text-sm px-5 py-2.5">+ Add Product</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"  value={formatPrice(vendor?.totalRevenue)}  icon={CurrencyRupeeIcon} color="bg-primary-500" />
        <StatCard title="Total Orders"   value={vendor?.totalOrders || 0}           icon={ShoppingBagIcon}  color="bg-blue-500" />
        <StatCard title="Total Products" value={vendor?.totalProducts || 0}         icon={CubeIcon}         color="bg-purple-500" />
        <StatCard title="Pending Payout" value={formatPrice(vendor?.pendingPayout)} icon={CurrencyRupeeIcon} color="bg-gold-500" />
      </div>

      {/* Revenue chart (simple bar) */}
      {revenueStats?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Revenue (Last 30 days)</h2>
          <div className="flex items-end gap-1 h-40">
            {revenueStats.slice(-14).map((d, i) => {
              const max = Math.max(...revenueStats.map((s) => s.revenue));
              const pct = max ? (d.revenue / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div className="bg-primary-500 hover:bg-primary-600 rounded-t transition-all" style={{ height: `${Math.max(pct * 1.4, 2)}px` }} />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 hidden group-hover:block whitespace-nowrap">
                      {formatPrice(d.revenue)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 truncate w-full text-center">{d._id?.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order status */}
        {orderStats?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Order Status</h2>
            <div className="space-y-3">
              {orderStats.map((s) => {
                const cfg = orderStatusConfig[s._id] || { label: s._id, color: 'bg-gray-100 text-gray-700' };
                return (
                  <div key={s._id} className="flex items-center justify-between">
                    <span className={`badge ${cfg.color} text-xs`}>{cfg.label}</span>
                    <span className="font-bold text-gray-700">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top products */}
        {topProducts?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Top Products</h2>
            <div className="space-y-3">
              {topProducts.map((tp, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-bold text-gray-400 text-sm w-4">#{i+1}</span>
                  {tp.product?.[0]?.images?.[0]?.url && (
                    <img src={tp.product[0].images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tp.product?.[0]?.name || 'Product'}</p>
                    <p className="text-xs text-gray-400">{tp.totalSold} sold</p>
                  </div>
                  <p className="text-sm font-bold text-primary-600 shrink-0">{formatPrice(tp.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Product', to: '/vendor/products/add', icon: '➕', color: 'bg-primary-50 text-primary-700 border-primary-200' },
          { label: 'View Orders', to: '/vendor/orders',       icon: '📦', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Analytics',   to: '/vendor/analytics',    icon: '📊', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Complete KYC',to: '/vendor/kyc',          icon: '📄', color: 'bg-gold-50 text-gold-700 border-gold-200' },
        ].map((a) => (
          <Link key={a.to} to={a.to} className={`border rounded-2xl p-5 text-center hover:shadow-md transition-all ${a.color}`}>
            <p className="text-3xl mb-2">{a.icon}</p>
            <p className="font-semibold text-sm">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
