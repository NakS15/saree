import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { categoryService, productService } from '../services';

export default function CategoryPage() {
  const { slug }   = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      categoryService.getBySlug(slug),
      productService.getAll({ category: slug, limit: 24 }),
    ]).then(([cat, prods]) => {
      setCategory(cat.data.data);
      setProducts(prods.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="page-container py-8">
      {!loading && category && (
        <div className="mb-8">
          {category.image && (
            <div className="h-40 md:h-56 rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-primary-700 to-gold-600 flex items-center justify-center relative">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover opacity-40" />
              <h1 className="font-serif text-4xl font-bold text-white absolute">{category.name}</h1>
            </div>
          )}
          {!category.image && <h1 className="section-title mb-2">{category.name}</h1>}
          {category.description && <p className="text-gray-500">{category.description}</p>}
          <p className="text-sm text-gray-400 mt-1">{products.length} products</p>
        </div>
      )}

      {loading
        ? <ProductGridSkeleton count={12} />
        : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
      }
    </div>
  );
}
