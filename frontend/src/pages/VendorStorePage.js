import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { vendorService } from '../services';

export default function VendorStorePage() {
  const { slug }   = useParams();
  const [vendor,   setVendor]   = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    vendorService.getStorefront(slug)
      .then((r) => { setVendor(r.data.data.vendor); setProducts(r.data.data.products); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-container py-10"><div className="skeleton h-40 rounded-2xl mb-8" /><ProductGridSkeleton /></div>;
  if (!vendor)  return <div className="page-container py-20 text-center text-gray-400">Vendor not found</div>;

  return (
    <div>
      {/* Vendor banner */}
      <div className="bg-saree-gradient">
        <div className="page-container py-10">
          <div className="flex items-center gap-6">
            {vendor.logo
              ? <img src={vendor.logo} alt={vendor.businessName} className="w-20 h-20 rounded-full object-cover border-4 border-white/30" />
              : <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white">{vendor.businessName[0]}</div>
            }
            <div className="text-white">
              <h1 className="font-serif text-3xl font-bold">{vendor.businessName}</h1>
              {vendor.businessAddress?.city && (
                <p className="text-white/80 text-sm mt-1">📍 {vendor.businessAddress.city}, {vendor.businessAddress.state}</p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <StarIcon className="w-4 h-4 fill-gold-300 text-gold-300" />
                <span className="text-sm font-semibold">{vendor.rating?.toFixed(1) || '—'}</span>
                <span className="text-white/60 text-xs">• {vendor.totalOrders || 0} orders fulfilled</span>
              </div>
            </div>
          </div>
          {vendor.businessDescription && (
            <p className="text-white/80 text-sm mt-5 max-w-2xl">{vendor.businessDescription}</p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="page-container py-8">
        <h2 className="section-title mb-6">Products ({products.length})</h2>
        {products.length === 0
          ? <p className="text-gray-400 text-center py-12">No products available from this vendor yet.</p>
          : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        }
      </div>
    </div>
  );
}
