import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist, selectWishlistIds } from '../../features/wishlist/wishlistSlice';
import { openCartDrawer } from '../../features/ui/uiSlice';
import { formatPrice } from '../../utils/helpers';

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

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.[1];

  return (
    <div className={`card group ${className}`}>
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-ethnic-silk">
          <LazyLoadImage
            src={primaryImage?.url || '/placeholder-saree.jpg'}
            alt={product.name}
            effect="blur"
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
            wrapperClassName="w-full h-full"
          />
          {secondaryImage && (
            <LazyLoadImage
              src={secondaryImage.url}
              alt={product.name}
              effect="blur"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              wrapperClassName="absolute inset-0 w-full h-full"
            />
          )}

          {/* Label */}
          {(product.isFeatured || product.isTrending) && (
            <span className="absolute top-0 left-0 badge bg-ivory/95 text-ink">
              {product.isFeatured ? 'Featured' : 'Trending'}
            </span>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className="absolute top-3 right-3 w-9 h-9 bg-ivory/90 rounded-full flex items-center justify-center hover:bg-ivory transition-colors duration-200"
          >
            {isWishlisted
              ? <HeartSolid className="w-[18px] h-[18px] text-primary-500" />
              : <HeartIcon className="w-[18px] h-[18px] text-gray-700" strokeWidth={1.25} />}
          </button>

          {/* Add to Cart - slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <button
              onClick={handleAddToCart}
              className="w-full bg-ink/95 hover:bg-primary-700 text-ivory py-4 text-[11px] font-medium uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCartIcon className="w-4 h-4" strokeWidth={1.25} />
              Add to Cart
            </button>
          </div>

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-ivory/70 flex items-center justify-center">
              <span className="border border-ink text-ink text-[11px] font-medium uppercase tracking-[0.22em] px-5 py-2">Sold Out</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-4 text-center">
          {product.vendor?.businessName && (
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gray-500 mb-1.5 truncate">{product.vendor.businessName}</p>
          )}
          <h3 className="font-serif text-lg md:text-xl font-medium text-ink leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {product.attributes?.fabric && (
            <p className="text-xs text-gray-500 mt-1 tracking-wide">{product.attributes.fabric}</p>
          )}

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="flex">
                {[1,2,3,4,5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-3 h-3 ${star <= Math.round(product.rating) ? 'fill-gold-500 text-gold-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-center gap-2.5 mt-2.5">
            <span className="text-sm font-medium tracking-wide text-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
