import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist, selectWishlistIds } from '../../features/wishlist/wishlistSlice';
import { openCartDrawer } from '../../features/ui/uiSlice';
import { formatPrice, discountPercent } from '../../utils/helpers';

export default function ProductCard({ product, className = '' }) {
  const dispatch     = useDispatch();
  const { user }     = useSelector((s) => s.auth);
  const wishlistIds  = useSelector(selectWishlistIds);
  const isWishlisted = wishlistIds.includes(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(openCartDrawer());
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    dispatch(toggleWishlist(product._id));
  };

  const discount = discountPercent(product.price, product.compareAtPrice);
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.[1];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`saree-card-hover card group ${className}`}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
          <LazyLoadImage
            src={primaryImage?.url || '/placeholder-saree.jpg'}
            alt={product.name}
            effect="blur"
            className="w-full h-full object-cover transition-opacity duration-500"
            wrapperClassName="w-full h-full"
          />
          {secondaryImage && (
            <LazyLoadImage
              src={secondaryImage.url}
              alt={product.name}
              effect="blur"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              wrapperClassName="absolute inset-0 w-full h-full"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge bg-primary-500 text-white text-xs font-bold">-{discount}%</span>
            )}
            {product.isTrending && (
              <span className="badge bg-orange-500 text-white text-xs">🔥 Trending</span>
            )}
            {product.isFeatured && (
              <span className="badge bg-gold-500 text-white text-xs">⭐ Featured</span>
            )}
            {product.attributes?.blousePieceIncluded && (
              <span className="badge bg-green-500 text-white text-xs">Blouse Included</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200"
          >
            {isWishlisted
              ? <HeartSolid className="w-5 h-5 text-primary-500" />
              : <HeartIcon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Add to Cart - slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              Add to Cart
            </button>
          </div>

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-full text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          {product.vendor?.businessName && (
            <p className="text-xs text-gray-400 mb-1 truncate">{product.vendor.businessName}</p>
          )}
          <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Attributes */}
          {product.attributes?.fabric && (
            <p className="text-xs text-gray-500 mt-1">{product.attributes.fabric}</p>
          )}

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex">
                {[1,2,3,4,5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
