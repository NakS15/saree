import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../services';
import { formatDate } from '../../utils/helpers';

export default function AdminVendorsPage() {
  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('pending');
  const [selected, setSelected] = useState(null);

  const fetch = () => {
    setLoading(true);
    adminService.getVendors({ status: filter || undefined })
      .then((r) => setVendors(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const review = async (id, action, reason = '') => {
    try {
      await adminService.reviewVendor(id, { action, reason });
      toast.success(`Vendor ${action}d successfully`);
      setSelected(null);
      fetch();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl font-bold text-gray-900">Vendor Management</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[['','All'],['pending','Pending'],['active','Active'],['rejected','Rejected'],['suspended','Suspended']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter===v?'bg-primary-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Vendor','Owner','Status','KYC','Joined','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {v.logo && <img src={v.logo} alt="" className="w-9 h-9 rounded-full object-cover bg-gray-100" />}
                      <div>
                        <p className="font-medium text-gray-800">{v.businessName}</p>
                        <p className="text-xs text-gray-400">{v.businessEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{v.user?.name}</p>
                    <p className="text-xs text-gray-400">{v.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${v.status==='active'?'bg-green-100 text-green-700':v.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${v.kyc?.status==='approved'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                      {v.kyc?.status || 'Not submitted'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(v.user?.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {v.status === 'pending' && (
                        <>
                          <button onClick={() => review(v._id, 'approve')} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-medium transition-colors">Approve</button>
                          <button onClick={() => { const r = prompt('Rejection reason:'); if (r) review(v._id, 'reject', r); }}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium transition-colors">Reject</button>
                        </>
                      )}
                      {v.status === 'active' && (
                        <button onClick={() => { const r = prompt('Suspension reason:'); if (r) review(v._id, 'suspend', r); }}
                          className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1.5 rounded-lg font-medium transition-colors">Suspend</button>
                      )}
                      {v.status === 'suspended' && (
                        <button onClick={() => review(v._id, 'approve')}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-medium transition-colors">Reactivate</button>
                      )}
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
