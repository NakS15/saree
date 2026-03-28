import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ethnic-cream flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <p className="text-9xl mb-6">🪡</p>
        <h1 className="font-serif text-6xl font-bold text-primary-600 mb-2">404</h1>
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-4">Oops! Page not found</h2>
        <p className="text-gray-500 mb-8">The saree you're looking for seems to have been sold out or moved to a different shelf.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
          <Link to="/products" className="btn-secondary px-8 py-3">Browse Sarees</Link>
        </div>
      </motion.div>
    </div>
  );
}
