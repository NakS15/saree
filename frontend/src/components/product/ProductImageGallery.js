import React, { useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed,    setIsZoomed]    = useState(false);
  const [zoomPos,     setZoomPos]     = useState({ x: 50, y: 50 });
  const [lightbox,    setLightbox]    = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  }, [isZoomed]);

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (!images.length) return (
    <div className="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">No image</div>
  );

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="hidden md:flex flex-col gap-2 w-20 shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${i === activeIndex ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-400'}`}
          >
            <img src={img.url} alt={img.alt || `Image ${i+1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1">
        <div
          className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={images[activeIndex]?.url}
              alt={images[activeIndex]?.alt || 'Saree'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            />
          </AnimatePresence>

          <button onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors">
            <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-700" />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors">
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors">
                <ChevronRightIcon className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-primary-500 w-4' : 'bg-white/70'}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile thumbnails */}
        <div className="md:hidden flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeIndex ? 'border-primary-500' : 'border-gray-200'}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <motion.img
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={images[activeIndex]?.url} alt="Saree"
              className="max-h-[90vh] max-w-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full">
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full">
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
