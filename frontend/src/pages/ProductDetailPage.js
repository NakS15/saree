import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { StarIcon, ShoppingCartIcon, HeartIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductCard from '../components/product/ProductCard';
import ReviewSection from '../components/product/ReviewSection';
import { ProductCardSkeleton } from '../components/ui/Skeletons';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist, selectWishlistIds } from '../features/wishlist/wishlistSlice';
import { openCartDrawer } from '../features/ui/uiSlice';
import { addRecentlyViewed } from '../features/products/productSlice';
import { productService } from '../services';
import { formatPrice, discountPercent } from '../utils/helpers';

export default function ProductDetailPage() {
  const { slug }    = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { user }    = useSelector((s) => s.auth);
  const wishlistIds = useSelector(selectWishlistIds);

  const [product,   setProduct]   = useState(null);
  const [related,   setRelated]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [qty,       setQty]       = useState(1);
  const [selColor,  setSelColor]  = useState('');
  const [tab,       setTab]       = useState('description');
  const [addingCart,setAddingCart]= useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    productService.getBySlug(slug)
      .then((res) => {
        setProduct(res.data.data);
        setRelated(res.data.related || []);
        dispatch(addRecentlyViewed(res.data.data));
        if (res.data.data.colors?.length) setSelColor(res.data.data.colors[0]);
      })
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAddingCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: qty, color: selColor })).unwrap();
      dispatch(openCartDrawer());
    } catch (err) { toast.error(err || 'Failed to add to cart'); }
    finally { setAddingCart(false); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  if (loading) return (
    <div className="page-container py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-[3/4] skeleton rounded-2xl" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-5 rounded" style={{ width: `${60 + i*7}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = discountPercent(product.price, product.compareAtPrice);
  const isWishlisted = wishlistIds.includes(product._id);

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Sarees</Link>
        {product.category && (<><span>/</span><Link to={`/category/${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link></>)}
        <span>/</span>
        <span className="text-gray-800 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Gallery */}
        <ProductImageGallery images={product.images} />

        {/* Details */}
        <div className="space-y-5">
          {/* Vendor */}
          {product.vendor && (
            <Link to={`/vendor/${product.vendor.slug}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {product.vendor.businessName} ↗
            </Link>
          )}

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <StarIcon key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="font-semibold text-gray-800">{product.rating?.toFixed(1)}</span>
            <a href="#reviews" className="text-primary-600 text-sm hover:underline">({product.numReviews} reviews)</a>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                <span className="badge bg-primary-100 text-primary-700 text-sm font-bold px-2.5 py-1">-{discount}% OFF</span>
              </>
            )}
          </div>
          {product.compareAtPrice > product.price && (
            <p className="text-green-600 text-sm font-medium">You save {formatPrice(product.compareAtPrice - product.price)}</p>
          )}

          {/* Attributes */}
          <div className="bg-ethnic-cream rounded-xl p-4 space-y-2">
            {[
              ['Fabric', product.attributes?.fabric],
              ['Work Type', product.attributes?.workType],
              ['Length', product.attributes?.length ? `${product.attributes.length}m` : null],
              ['Blouse Piece', product.attributes?.blousePieceIncluded ? 'Included' : 'Not Included'],
              ['Origin', product.attributes?.origin],
            ].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-24 shrink-0">{label}:</span>
                <span className="font-medium text-gray-800">{val}</span>
              </div>
            ))}
            {product.attributes?.occasion?.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 w-24 shrink-0">Occasion:</span>
                <div className="flex flex-wrap gap-1">
                  {product.attributes.occasion.map((o) => (
                    <span key={o} className="badge bg-white border border-gray-200 text-gray-700">{o}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Color selector */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Color: <span className="text-primary-600">{selColor}</span></p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setSelColor(c)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selColor === c ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 hover:bg-gray-100 text-lg font-medium transition-colors">−</button>
              <span className="px-5 py-2.5 font-semibold text-gray-800 border-x border-gray-300">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-2.5 hover:bg-gray-100 text-lg font-medium transition-colors">+</button>
            </div>
            <span className="text-xs text-gray-400">{product.stock} left in stock</span>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={addingCart || product.stock === 0}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3.5">
              <ShoppingCartIcon className="w-5 h-5" />
              {addingCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0}
              className="btn-primary flex-1 py-3.5">
              {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
            <button onClick={() => { if (!user) { navigate('/login'); return; } dispatch(toggleWishlist(product._id)); }}
              className="p-3.5 border border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors">
              {isWishlisted ? <HeartSolid className="w-6 h-6 text-primary-500" /> : <HeartIcon className="w-6 h-6 text-gray-600" />}
            </button>
          </div>

          {/* Shipping info */}
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {[
              { icon: TruckIcon, title: 'Free Delivery', desc: 'Orders above ₹999. Estimated: 5-7 business days' },
              { icon: ArrowPathIcon, title: '7-Day Returns', desc: 'Easy hassle-free returns. T&C apply' },
              { icon: ShieldCheckIcon, title: 'Authentic Products', desc: 'Verified seller. Quality guaranteed' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3.5">
                <Icon className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description / Seller / Care */}
      <div className="mt-14" id="reviews">
        <div className="flex border-b border-gray-200 gap-1 mb-8 overflow-x-auto scrollbar-hide">
          {[['description','Description'],['seller','Seller Info'],['reviews',`Reviews (${product.numReviews})`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'description' && (
            <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose max-w-none text-gray-700">
              <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
              {product.attributes?.careInstructions && (
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Care Instructions</h4>
                  <p className="text-blue-700 text-sm">{product.attributes.careInstructions}</p>
                </div>
              )}
            </motion.div>
          )}
          {tab === 'seller' && product.vendor && (
            <motion.div key="seller" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-ethnic-cream rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  {product.vendor.logo && <img src={product.vendor.logo} alt={product.vendor.businessName} className="w-16 h-16 rounded-full object-cover" />}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-gray-900">{product.vendor.businessName}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon className="w-4 h-4 fill-gold-400 text-gold-400" />
                      <span className="font-semibold text-sm">{product.vendor.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{product.vendor.returnPolicy}</p>
                <Link to={`/vendor/${product.vendor.slug}`} className="btn-secondary text-sm py-2.5 inline-block">
                  Visit Seller Store
                </Link>
              </div>
            </motion.div>
          )}
          {tab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReviewSection productId={product._id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
