import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { formatPrice, formatDate, orderStatusConfig } from '../../utils/helpers';
import { UsersIcon, BuildingStorefrontIcon, CubeIcon, ShoppingBagIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}><Icon className="w-6 h-6 text-white" /></div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState(30);

  useEffect(() => {
    setLoading(true);
    adminService.getAnalytics({ period })
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28" />)}
    </div>
  );

  const { summary, revenueStats, orderStatusStats, newUserStats } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users"    value={summary?.totalUsers?.toLocaleString()}   icon={UsersIcon}             color="bg-blue-500" />
        <StatCard title="Active Vendors" value={summary?.totalVendors}                   icon={BuildingStorefrontIcon} color="bg-purple-500" />
        <StatCard title="Live Products"  value={summary?.totalProducts}                  icon={CubeIcon}               color="bg-teal-500" />
        <StatCard title="Total Orders"   value={summary?.totalOrders?.toLocaleString()}  icon={ShoppingBagIcon}        color="bg-orange-500" />
        <StatCard title="Gross Revenue"  value={formatPrice(summary?.gmv)}               icon={CurrencyRupeeIcon}      color="bg-green-500" sub="All time" />
        <StatCard title="Platform Revenue" value={formatPrice(summary?.platformRevenue)} icon={CurrencyRupeeIcon}      color="bg-primary-500" sub="10% commission" />
        <StatCard title="Pending Vendors" value={summary?.pendingVendors || 0}           icon={BuildingStorefrontIcon} color="bg-yellow-500" sub="Awaiting approval" />
        <StatCard title="Pending Products" value={summary?.pendingProducts || 0}         icon={CubeIcon}               color="bg-red-500" sub="Awaiting review" />
      </div>

      {/* Revenue chart */}
      {revenueStats?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-5">Revenue Trend ({period} days)</h2>
          <div className="flex items-end gap-1 h-48">
            {revenueStats.slice(-20).map((d, i) => {
              const max = Math.max(...revenueStats.map((s) => s.revenue));
              const pct = max ? (d.revenue / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                  <div className="w-full bg-primary-500 hover:bg-primary-600 rounded-t transition-all relative"
                    style={{ height: `${Math.max(pct * 1.9, 2)}px` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 hidden group-hover:block whitespace-nowrap z-10">
                      {formatPrice(d.revenue)}<br />{d.orders} orders
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">{d._id?.slice(8)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order status + New Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {orderStatusStats?.map((s) => {
              const cfg = orderStatusConfig[s._id] || { label: s._id, color: 'bg-gray-100 text-gray-700' };
              const total = orderStatusStats.reduce((sum, x) => sum + x.count, 0);
              const pct   = total ? (s.count / total) * 100 : 0;
              return (
                <div key={s._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`badge ${cfg.color} text-xs`}>{cfg.label}</span>
                    <span className="font-bold text-gray-700">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">New User Signups</h2>
          <div className="flex items-end gap-1 h-36">
            {(newUserStats || []).slice(-14).map((d, i) => {
              const max = Math.max(...(newUserStats || []).map((s) => s.count));
              const pct = max ? (d.count / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-blue-400 hover:bg-blue-500 rounded-t transition-colors"
                    style={{ height: `${Math.max(pct * 1.3, 2)}px` }} />
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">{d._id?.slice(8)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Review Vendors', to: '/admin/vendors?status=pending',  icon: '🏪', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'Review Products', to: '/admin/products', icon: '📦', color: 'bg-teal-50 border-teal-200 text-teal-700' },
          { label: 'Manage Coupons', to: '/admin/coupons',   icon: '🏷️', color: 'bg-gold-50 border-gold-200 text-gold-700' },
          { label: 'All Orders',     to: '/admin/orders',    icon: '📋', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map((a) => (
          <a key={a.to} href={a.to} className={`border rounded-2xl p-5 text-center hover:shadow-md transition-all ${a.color}`}>
            <p className="text-3xl mb-2">{a.icon}</p>
            <p className="font-semibold text-sm">{a.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
