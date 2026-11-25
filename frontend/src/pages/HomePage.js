import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { motion } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeletons';
import { productService } from '../services';

const HERO_SLIDES = [
  { eyebrow: 'The Bridal Edit', title: 'Heirloom weaves,', accent: 'made to be inherited.', subtitle: 'Banarasi and Kanjivaram sarees from master weavers, made for the moments that matter most.', cta: 'Discover Bridal', link: '/category/bridal-sarees', glow: '#5b1a22' },
  { eyebrow: 'Handloom Heritage', title: 'The hand behind', accent: 'every thread.', subtitle: 'Distinguished handloom pieces, sourced directly from India\'s master weavers.', cta: 'Explore Handloom', link: '/category/handloom-sarees', glow: '#143c37' },
  { eyebrow: 'Designer Ateliers', title: 'Contemporary', accent: 'couture drapes.', subtitle: 'Limited-edition pieces from independent designers, presented in considered collections.', cta: 'View Designer Sarees', link: '/category/designer-sarees', glow: '#232a4d' },
];

const CATEGORY_CARDS = [
  { name: 'Silk',       slug: 'silk-sarees' },
  { name: 'Cotton',     slug: 'cotton-sarees' },
  { name: 'Bridal',     slug: 'bridal-sarees' },
  { name: 'Designer',   slug: 'designer-sarees' },
  { name: 'Georgette',  slug: 'georgette-sarees' },
  { name: 'Kanjivaram', slug: 'kanjivaram-sarees' },
];

const TRUST = [
  { title: 'Complimentary Shipping', desc: 'On orders above ₹999' },
  { title: 'Considered Returns',     desc: '7-day return policy' },
  { title: 'Secure Checkout',        desc: 'Razorpay & UPI' },
  { title: 'Curated Ateliers',       desc: 'KYC verified vendors' },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

// Concentric-circle and rotated-square motif inspired by jaali lattice work.
function Motif({ className = '' }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="0.6" className={className} aria-hidden="true">
      {[190, 150, 110, 70, 30].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
      <rect x="70" y="70" width="260" height="260" />
      <rect x="70" y="70" width="260" height="260" transform="rotate(45 200 200)" />
      {[0, 45, 90, 135].map((a) => <line key={a} x1="200" y1="10" x2="200" y2="390" transform={`rotate(${a} 200 200)`} />)}
    </svg>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      <span className="block h-px w-12 bg-gold-500 mx-auto mt-6" />
    </div>
  );
}

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
    <div className="min-h-screen -mb-16">
      {/* Hero */}
      <section className="relative">
        <Swiper modules={[Autoplay, Pagination, EffectFade]} effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 6500, disableOnInteraction: false }}
          pagination={{ clickable: true }} loop className="hero-swiper h-[78vh] min-h-[560px]">
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="h-full relative overflow-hidden woven flex items-center"
                style={{ backgroundColor: '#14100e', backgroundImage: `radial-gradient(ellipse 70% 85% at 78% 45%, ${slide.glow} 0%, transparent 70%)` }}>
                <div className="absolute inset-4 md:inset-8 border border-gold-300/25 pointer-events-none" />
                <Motif className="hidden md:block absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] text-gold-300 opacity-[0.16]" />
                <div className="page-container relative z-10 w-full">
                  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                    className="max-w-2xl pl-3 md:pl-8">
                    <p className="eyebrow !text-gold-300 mb-6">{slide.eyebrow}</p>
                    <h1 className="font-serif font-light text-5xl md:text-7xl !text-ivory leading-[1.04] mb-6">
                      {slide.title}
                      <span className="block italic !text-gold-300">{slide.accent}</span>
                    </h1>
                    <p className="text-ivory/70 text-base md:text-lg font-light max-w-md leading-relaxed mb-10">{slide.subtitle}</p>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                      <Link to={slide.link} className="bg-ivory text-ink hover:bg-gold-300 transition-colors duration-300 text-xs font-medium uppercase tracking-[0.2em] px-8 py-4">
                        {slide.cta}
                      </Link>
                      <Link to="/products" className="link-underline !text-ivory !border-ivory/40 hover:!border-ivory">
                        View All Collections
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Assurances */}
      <section className="border-b border-gray-200">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x divide-gray-200">
            {TRUST.map((b) => (
              <div key={b.title} className="text-center py-7 px-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink">{b.title}</p>
                <p className="text-xs text-gray-500 mt-1.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-20 md:py-28">
        <SectionHeader eyebrow="The Collections" title="Shop by Weave" />
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {CATEGORY_CARDS.map((cat, i) => (
            <motion.div key={cat.slug} variants={fadeUp}>
              <Link to={`/category/${cat.slug}`}
                className="group relative flex flex-col justify-between aspect-[4/5] lg:aspect-[3/4] p-5 md:p-6 bg-ethnic-silk hover:bg-ink overflow-hidden transition-colors duration-500">
                <span className="text-[11px] font-medium tracking-[0.3em] text-gold-600 group-hover:text-gold-300 transition-colors">0{i + 1}</span>
                <Motif className="absolute -right-12 -bottom-12 w-52 text-gold-600/25 group-hover:text-gold-300/30 transition-colors duration-500" />
                <div className="relative">
                  <h3 className="font-serif text-2xl md:text-[1.75rem] leading-tight group-hover:!text-ivory transition-colors duration-500">{cat.name}</h3>
                  <span className="block h-px w-8 bg-gold-500 mt-4 group-hover:w-16 transition-all duration-500" />
                  <span className="block mt-3 text-[10px] font-medium uppercase tracking-[0.24em] text-gray-500 group-hover:text-ivory/70 transition-colors">Explore</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured */}
      <section className="bg-ethnic-cream py-20 md:py-28">
        <div className="page-container">
          <SectionHeader eyebrow="Handpicked" title="Featured Pieces" />
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12">
              {featured.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div className="text-center mt-16">
            <Link to="/products?isFeatured=true" className="link-underline">View All Featured</Link>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="relative bg-ink woven overflow-hidden">
        <Motif className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] text-gold-300 opacity-[0.12]" />
        <div className="relative page-container py-24 md:py-36 text-center">
          <p className="eyebrow !text-gold-300 mb-6">Our Philosophy</p>
          <h2 className="font-serif font-light text-4xl md:text-6xl !text-ivory leading-[1.1] max-w-3xl mx-auto">
            Every piece carries the <span className="italic !text-gold-300">signature</span> of its maker.
          </h2>
          <p className="text-ivory/60 font-light text-base md:text-lg max-w-xl mx-auto mt-8 leading-relaxed">
            We bring together master weavers and independent designers whose work is made slowly, in small numbers, and meant to last.
          </p>
          <Link to="/products" className="inline-block mt-12 border border-ivory/40 hover:border-ivory hover:bg-ivory hover:text-ink text-ivory transition-colors duration-300 text-xs font-medium uppercase tracking-[0.2em] px-9 py-4">
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* Trending */}
      <section className="page-container py-20 md:py-28">
        <SectionHeader eyebrow="Currently in Demand" title="Most Coveted" />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12">
            {trending.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
        <div className="text-center mt-16">
          <Link to="/products?isTrending=true" className="link-underline">View All Trending</Link>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="bg-ethnic-silk">
        <div className="page-container py-20 md:py-24 grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div>
            <p className="eyebrow mb-5">For Designers &amp; Weavers</p>
            <h2 className="section-title">Present your atelier to a discerning clientele.</h2>
          </div>
          <div>
            <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed max-w-md">
              Apply to join a curated marketplace of independent designers and master weavers.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-5 mt-8">
              <Link to="/register?role=vendor" className="btn-primary">Apply to Sell</Link>
              <Link to="/seller-guidelines" className="link-underline">Seller Guidelines</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}