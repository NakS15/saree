import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../components/product/ProductCard';

export default function WishlistPage() {
  const { items } = useSelector((s) => s.wishlist);

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8">My Wishlist <span className="text-gray-400 font-normal text-lg">({items.length})</span></h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">❤️</p>
          <h3 className="font-serif text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400">Save the sarees you love by tapping the heart icon</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((p) => <ProductCard key={p._id || p} product={p} />)}
        </div>
      )}
    </div>
  );
}
