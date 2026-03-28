import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { adminService } from '../../services';
import { formatDate } from '../../utils/helpers';

export default function AdminCouponsPage() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: { type: 'percentage', perUserLimit: 1 } });
  const type = watch('type');

  const fetch = () => {
    adminService.getCoupons().then((r) => setCoupons(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const onCreate = async (data) => {
    try {
      await adminService.createCoupon({ ...data, value: +data.value, minOrderAmount: +data.minOrderAmount || 0, usageLimit: +data.usageLimit || undefined, maxDiscountAmount: +data.maxDiscountAmount || undefined, perUserLimit: +data.perUserLimit, startDate: data.startDate || undefined, endDate: data.endDate || undefined });
      toast.success('Coupon created!');
      reset(); setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create coupon'); }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await adminService.deleteCoupon(id);
    toast.success('Coupon deleted');
    fetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Create Coupon</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Code *</label>
              <input {...register('code', { required: true })} placeholder="SAVE20" className="input-field text-sm py-2.5 uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select {...register('type')} className="input-field text-sm py-2.5">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            {type !== 'free_shipping' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{type === 'percentage' ? 'Discount %' : 'Discount ₹'} *</label>
                <input {...register('value', { required: true })} type="number" placeholder="20" className="input-field text-sm py-2.5" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Order (₹)</label>
              <input {...register('minOrderAmount')} type="number" placeholder="0" className="input-field text-sm py-2.5" />
            </div>
            {type === 'percentage' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Discount (₹)</label>
                <input {...register('maxDiscountAmount')} type="number" placeholder="500" className="input-field text-sm py-2.5" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Usage Limit</label>
              <input {...register('usageLimit')} type="number" placeholder="100" className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Per User Limit</label>
              <input {...register('perUserLimit')} type="number" placeholder="1" className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input {...register('startDate')} type="date" className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input {...register('endDate')} type="date" className="input-field text-sm py-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input {...register('description')} placeholder="Brief description" className="input-field text-sm py-2.5" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm px-6">Create Coupon</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-5">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="bg-white rounded-xl h-16" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Code','Type','Value','Min Order','Used / Limit','Expires','Status','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-primary-700 text-sm">{c.code}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{c.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-semibold">{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `₹${c.value}` : 'Free'}</td>
                  <td className="px-4 py-3 text-gray-600">₹{c.minOrderAmount}</td>
                  <td className="px-4 py-3 text-gray-600">{c.usedCount} / {c.usageLimit || '∞'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.endDate ? formatDate(c.endDate) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onDelete(c._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
