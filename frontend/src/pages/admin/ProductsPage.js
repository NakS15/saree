import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../services';
import { formatPrice, formatDate } from '../../utils/helpers';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetch = () => {
    setLoading(true);
    adminService.getPendingProducts()
      .then((r) => setProducts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const review = async (id, action) => {
    let note = '';
    if (action === 'reject') { note = prompt('Reason for rejection (optional):') || ''; }
    try {
      await adminService.reviewProduct(id, { action, note });
      toast.success(`Product ${action}d!`);
      fetch();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl font-bold text-gray-900">
        Products Pending Review <span className="text-gray-400 font-normal text-lg">({products.length})</span>
      </h1>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="bg-white rounded-xl h-24 animate-pulse"/>)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold text-gray-700">All products reviewed!</p>
          <p className="text-gray-400 text-sm mt-1">No products pending approval</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex gap-5">
                <img src={p.images?.[0]?.url} alt={p.name} className="w-24 h-28 object-cover rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">{p.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">by {p.vendor?.businessName} · {p.category?.name}</p>
                    </div>
                    <p className="font-bold text-primary-600 text-lg shrink-0">{formatPrice(p.price)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
                    {[['Fabric', p.attributes?.fabric], ['Stock', p.stock], ['Submitted', formatDate(p.createdAt)]].filter(([,v])=>v).map(([k,v]) => (
                      <span key={k} className="bg-gray-100 px-2 py-1 rounded-full">{k}: <strong className="text-gray-700">{v}</strong></span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => review(p._id, 'approve')}
                  className="flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                  <CheckIcon className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => review(p._id, 'reject')}
                  className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                  <XMarkIcon className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
