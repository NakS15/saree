import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ethnic-cream flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <p className="eyebrow mb-4">Error 404</p>
        <h1 className="font-serif font-light text-7xl text-ink mb-4">Page not found</h1>
        <p className="text-gray-500 font-light mb-10">The piece you're looking for may have been sold or moved to another collection.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/products" className="btn-secondary">Browse Collections</Link>
        </div>
      </motion.div>
    </div>
  );
}
