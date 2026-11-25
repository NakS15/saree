import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!images.length) return (
    <div className="aspect-[3/4] bg-ethnic-silk flex items-center justify-center text-gray-400 text-xs uppercase tracking-[0.2em]">No image</div>
  );

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="hidden md:flex flex-col gap-2 w-20 shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`aspect-square overflow-hidden border transition-all duration-200 ${i === activeIndex ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            <img src={img.url} alt={img.alt || `Image ${i+1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1">
        <div
          className="relative aspect-[3/4] overflow-hidden bg-ethnic-silk cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightbox(true)}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={i === activeIndex ? (img.alt || 'Saree') : ''}
              className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out ${i === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isZoomed && i === activeIndex ? 'scale-150' : 'scale-100'}`}
              style={isZoomed && i === activeIndex ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            />
          ))}

          <button onClick={(e) => { e.stopPropagation(); setLightbox(true); }} aria-label="Enlarge image"
            className="absolute top-4 right-4 bg-ivory/90 w-10 h-10 flex items-center justify-center rounded-full hover:bg-ivory transition-colors">
            <MagnifyingGlassPlusIcon className="w-5 h-5 text-ink" strokeWidth={1.25} />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-ivory/90 w-10 h-10 flex items-center justify-center rounded-full hover:bg-ivory transition-colors">
                <ChevronLeftIcon className="w-5 h-5 text-ink" strokeWidth={1.25} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-ivory/90 w-10 h-10 flex items-center justify-center rounded-full hover:bg-ivory transition-colors">
                <ChevronRightIcon className="w-5 h-5 text-ink" strokeWidth={1.25} />
              </button>
            </>
          )}

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }} aria-label={`Image ${i + 1}`}
                className={`h-[2px] transition-all ${i === activeIndex ? 'bg-ink w-8' : 'bg-ink/30 w-5'}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile thumbnails */}
        <div className="md:hidden flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 overflow-hidden border transition-all ${i === activeIndex ? 'border-ink' : 'border-transparent opacity-60'}`}>
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
            className="fixed inset-0 bg-ink/95 z-[200] flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <motion.img
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              src={images[activeIndex]?.url} alt="Saree"
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={() => setLightbox(false)} aria-label="Close" className="absolute top-5 right-5 p-3 text-ivory/80 hover:text-ivory">
              <XMarkIcon className="w-7 h-7" strokeWidth={1.25} />
            </button>
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image" className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-ivory/70 hover:text-ivory">
                  <ChevronLeftIcon className="w-8 h-8" strokeWidth={1.25} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-ivory/70 hover:text-ivory">
                  <ChevronRightIcon className="w-8 h-8" strokeWidth={1.25} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
