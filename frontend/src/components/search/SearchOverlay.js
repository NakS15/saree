import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { closeSearch } from '../../features/ui/uiSlice';
import { productService } from '../../services';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { formatPrice } from '../../utils/helpers';

export default function SearchOverlay() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { searchOpen } = useSelector((s) => s.ui);
  const inputRef   = useRef(null);

  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState({ products: [], categories: [] });
  const [loading,  setLoading]  = useState(false);
  const [recent,   setRecent]   = useState(() => JSON.parse(localStorage.getItem('recentSearches') || '[]'));

  useEffect(() => {
    if (searchOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults({ products: [], categories: [] }); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productService.autocomplete(query);
        setResults(res.data.data);
      } catch { setResults({ products: [], categories: [] }); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (q = query) => {
    if (!q.trim()) return;
    const searches = [q, ...recent.filter((r) => r !== q)].slice(0, 6);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    setRecent(searches);
    dispatch(closeSearch());
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
    setQuery('');
  };

  const handleClose = () => { dispatch(closeSearch()); setQuery(''); };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="bg-white w-full max-w-3xl mx-auto mt-16 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for sarees, fabrics, occasions..."
                className="flex-1 text-lg outline-none text-gray-800 placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 border-l border-gray-200 pl-4">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* Loading */}
              {loading && <div className="text-center text-gray-400 py-8">Searching...</div>}

              {/* Results */}
              {!loading && query && (
                <>
                  {results.categories?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {results.categories.map((cat) => (
                          <button key={cat._id} onClick={() => { dispatch(closeSearch()); navigate(`/category/${cat.slug}`); }}
                            className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors">
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.products?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Products</p>
                      <div className="space-y-2">
                        {results.products.map((product) => (
                          <button key={product._id} onClick={() => { dispatch(closeSearch()); navigate(`/products/${product.slug}`); }}
                            className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                            <LazyLoadImage src={product.images?.[0]?.url} alt={product.name}
                              className="w-14 h-14 object-cover rounded-lg bg-gray-100" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{product.name}</p>
                              <p className="text-sm text-primary-600 font-semibold">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {!results.products?.length && !results.categories?.length && (
                    <p className="text-center text-gray-400 py-8">No results found for "{query}"</p>
                  )}
                </>
              )}

              {/* Recent searches */}
              {!query && recent.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Searches</p>
                  <div className="space-y-1">
                    {recent.map((r) => (
                      <button key={r} onClick={() => handleSearch(r)}
                        className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-gray-50 text-left">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular searches */}
              {!query && (
                <div className={recent.length ? 'mt-5' : ''}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Banarasi Silk', 'Kanjivaram', 'Cotton Saree', 'Bridal Lehenga', 'Georgette', 'Designer Saree'].map((s) => (
                      <button key={s} onClick={() => handleSearch(s)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
