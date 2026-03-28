import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeletons';
import { productService, categoryService } from '../services';

const HERO_SLIDES = [
  { title: 'Discover Timeless Elegance', subtitle: 'Authentic Banarasi & Kanjivaram Sarees', cta: 'Shop Bridal Collection', link: '/category/bridal-sarees', bg: 'from-primary-900 via-primary-700 to-amber-800', emoji: '🥻' },
  { title: 'Handloom Heritage', subtitle: 'Direct from India\'s Master Weavers', cta: 'Explore Handloom', link: '/category/handloom-sarees', bg: 'from-amber-800 via-amber-700 to-teal-800', emoji: '🪡' },
  { title: 'Summer Cotton Collection', subtitle: 'Lightweight & Breathable Everyday Sarees', cta: 'Shop Cotton Sarees', link: '/category/cotton-sarees', bg: 'from-teal-800 via-primary-700 to-primary-900', emoji: '🌸' },
];

const CATEGORY_CARDS = [
  { name: 'Silk Sarees',     slug: 'silk-sarees',     emoji: '✨', bg: 'from-yellow-50 to-amber-100',  border: 'border-amber-200' },
  { name: 'Cotton Sarees',   slug: 'cotton-sarees',   emoji: '🌿', bg: 'from-green-50 to-emerald-100', border: 'border-emerald-200' },
  { name: 'Bridal Sarees',   slug: 'bridal-sarees',   emoji: '👰', bg: 'from-pink-50 to-rose-100',     border: 'border-rose-200' },
  { name: 'Designer Sarees', slug: 'designer-sarees', emoji: '💎', bg: 'from-purple-50 to-violet-100', border: 'border-violet-200' },
  { name: 'Georgette',       slug: 'georgette-sarees',emoji: '🌺', bg: 'from-orange-50 to-red-100',    border: 'border-red-200' },
  { name: 'Kanjivaram',      slug: 'kanjivaram-sarees',emoji:'🏛️',bg: 'from-indigo-50 to-blue-100',   border: 'border-blue-200' },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
  const [featured,  setFeatured]  = useState([]);
  const [trending,  setTrending]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([productService.getFeatured(), productService.getTrending()])
      .then(([f, t]) => { setFeatured(f.data.data); setTrending(t.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <section className="relative">
        <Swiper modules={[Autoplay, Pagination, Navigation, EffectFade]} effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }} navigation loop className="h-[60vh] md:h-[75vh]">
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className={`h-full bg-gradient-to-r ${slide.bg} flex items-center relative overflow-hidden`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    backgroundSize: '60px' }} />
                <div className="page-container flex items-center justify-between w-full">
                  <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                    className="max-w-xl">
                    <p className="text-gold-200 text-sm font-semibold uppercase tracking-widest mb-3">SareeBazaar Exclusive</p>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-4">{slide.title}</h1>
                    <p className="text-white/80 text-lg md:text-xl mb-8">{slide.subtitle}</p>
                    <div className="flex gap-4">
                      <Link to={slide.link} className="btn-gold text-base px-8 py-4 inline-flex items-center gap-2">
                        {slide.cta} <ArrowRightIcon className="w-5 h-5" />
                      </Link>
                      <Link to="/products" className="border-2 border-white/60 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                        Browse All
                      </Link>
                    </div>
                  </motion.div>
                  <div className="hidden lg:block text-[160px] opacity-20 select-none animate-pulse">{slide.emoji}</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Trust Badges */}
      <section className="bg-ethnic-cream border-y border-amber-100">
        <div className="page-container py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
              { icon: '↩️', title: 'Easy Returns',  desc: '7-day return policy' },
              { icon: '🔒', title: 'Secure Payment',desc: 'Razorpay & UPI' },
              { icon: '✅', title: 'Verified Sellers',desc: 'KYC verified vendors' },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-3 justify-center py-2">
                <span className="text-2xl">{b.icon}</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">{b.title}</p>
                  <p className="text-gray-500 text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-1">Explore</p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_CARDS.map((cat) => (
            <motion.div key={cat.slug} variants={fadeUp}>
              <Link to={`/category/${cat.slug}`}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br ${cat.bg} border ${cat.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group`}>
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                <span className="font-semibold text-gray-800 text-sm leading-tight">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Sarees */}
      <section className="bg-ethnic-cream py-12">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-1">Handpicked</p>
              <h2 className="section-title">Featured Sarees</h2>
            </div>
            <Link to="/products?isFeatured=true" className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1">
              See All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="page-container py-12">
        <div className="bg-saree-gradient rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative px-8 py-12 md:py-16 text-center">
            <p className="text-gold-200 text-sm uppercase tracking-widest font-semibold mb-2">Limited Time Offer</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">Up to 50% Off</h2>
            <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">On select bridal and designer sarees. Use code <span className="font-bold text-gold-300 bg-white/10 px-2 py-0.5 rounded">BRIDE50</span></p>
            <Link to="/products" className="btn-gold inline-flex items-center gap-2 text-base px-10 py-4">
              Shop the Sale <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="page-container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-1">🔥 What's Hot</p>
            <h2 className="section-title">Trending Now</h2>
          </div>
          <Link to="/products?isTrending=true" className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1">
            See All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Vendor CTA */}
      <section className="bg-gray-900 py-16">
        <div className="page-container text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Sell Your Sarees on SareeBazaar</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Join 500+ verified vendors. Reach millions of saree lovers across India. Start earning today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=vendor" className="btn-gold text-base px-10 py-4 inline-flex items-center gap-2">
              Start Selling <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link to="/seller-guidelines" className="border-2 border-gray-600 text-gray-300 px-10 py-4 rounded-lg font-semibold hover:border-gray-400 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}