import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, ArchiveBoxIcon, EyeIcon } from '@heroicons/react/24/outline';
import { productService } from '../../services';
import { formatPrice } from '../../utils/helpers';

const STATUS_COLORS = {
  active:           'bg-green-100 text-green-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  rejected:         'bg-red-100 text-red-700',
  draft:            'bg-gray-100 text-gray-600',
  archived:         'bg-gray-100 text-gray-500',
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  const fetch = () => {
    setLoading(true);
    productService.getMyProducts({ page, limit: 10, status: filter || undefined })
      .then((r) => { setProducts(r.data.data); setTotal(r.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this product?')) return;
    await productService.delete(id);
    fetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-gray-900">My Products <span className="text-gray-400 font-normal text-lg">({total})</span></h1>
        <Link to="/vendor/products/add" className="btn-primary text-sm px-5 py-2.5">+ Add Product</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[['','All'],['active','Active'],['pending_approval','Pending'],['rejected','Rejected'],['archived','Archived']].map(([v,l]) => (
          <button key={v} onClick={() => { setFilter(v); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter===v?'bg-primary-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-semibold text-gray-700 mb-2">No products found</h3>
          <Link to="/vendor/products/add" className="btn-primary text-sm mt-4 inline-block">Add Your First Product</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Product','Price','Stock','Status','Sales','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.attributes?.fabric}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.totalSales || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/products/${p.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link to={`/vendor/products/edit/${p._id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </button>
                    </div>
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
