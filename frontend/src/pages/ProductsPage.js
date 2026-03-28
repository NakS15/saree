import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { productService } from '../services';
import { setFilter, setPage } from '../features/products/productSlice';
import { buildQueryString } from '../utils/helpers';

export default function ProductsPage() {
  const dispatch    = useDispatch();
  const { filters } = useSelector((s) => s.products);
  const [searchParams] = useSearchParams();

  const [products,  setProducts]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [totalPages,setTotalPages]= useState(1);
  const [loading,   setLoading]   = useState(true);
  const [gridView,  setGridView]  = useState(true);
  const [mobileFilter,setMobile] = useState(false);

  // Sync URL params into redux filters
  useEffect(() => {
    const q = searchParams.get('q');
    const isFeatured = searchParams.get('isFeatured');
    const isTrending = searchParams.get('isTrending');
    if (q) dispatch(setFilter({ q }));
    if (isFeatured) dispatch(setFilter({ isFeatured }));
    if (isTrending)  dispatch(setFilter({ isTrending }));
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildQueryString({ ...filters, limit: 12 });
      const res = await productService.getAll(Object.fromEntries(new URLSearchParams(params)));
      setProducts(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handlePageChange = (p) => {
    dispatch(setPage(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container py-6 md:py-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="section-title">
          {filters.q ? `Results for "${filters.q}"` : 'All Sarees'}
        </h1>
        {!loading && <p className="text-gray-500 text-sm mt-1">{total} sarees found</p>}
      </div>

      <div className="flex gap-8">
        {/* Desktop filters */}
        <div className="hidden lg:block">
          <ProductFilters />
        </div>

        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <button onClick={() => setMobile(true)}
              className="lg:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              <FunnelIcon className="w-4 h-4" /> Filters
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setGridView(true)}
                className={`p-2 rounded-lg transition-colors ${gridView ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button onClick={() => setGridView(false)}
                className={`p-2 rounded-lg transition-colors ${!gridView ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🥻</p>
              <h3 className="font-serif text-2xl font-semibold text-gray-700 mb-2">No sarees found</h3>
              <p className="text-gray-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className={gridView
              ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5'
              : 'space-y-4'}>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} className={!gridView ? 'flex-row' : ''} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                ← Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${filters.page === p ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilter && <ProductFilters isMobile onClose={() => setMobile(false)} />}
      </AnimatePresence>
    </div>
  );
}
