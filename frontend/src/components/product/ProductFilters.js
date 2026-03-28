import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StarIcon, FunnelIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { setFilter, resetFilters } from '../../features/products/productSlice';
import RangeSlider from '../ui/RangeSlider';

const FABRICS    = ['Silk', 'Cotton', 'Chiffon', 'Georgette', 'Linen', 'Net', 'Banarasi', 'Kanjivaram', 'Chanderi', 'Tussar'];
const OCCASIONS  = ['Wedding', 'Casual', 'Party', 'Festival', 'Office', 'Bridal', 'Religious'];
const WORK_TYPES = ['Zari', 'Embroidery', 'Printed', 'Plain', 'Woven', 'Handloom', 'Block Print', 'Digital Print', 'Bandhani'];
const COLORS     = [
  { name: 'Red',    hex: '#ef4444' }, { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Green',  hex: '#22c55e' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'Pink',   hex: '#ec4899' }, { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' }, { name: 'White',  hex: '#f9fafb' },
  { name: 'Black',  hex: '#111827' }, { name: 'Gold',   hex: '#d97706' },
  { name: 'Maroon', hex: '#800000' }, { name: 'Navy',   hex: '#1e3a8a' },
];
const SORT_OPTIONS = [
  { label: 'Newest First',    value: '-createdAt' },
  { label: 'Price: Low-High', value: 'price' },
  { label: 'Price: High-Low', value: '-price' },
  { label: 'Most Popular',    value: '-totalSales' },
  { label: 'Top Rated',       value: '-rating' },
];

export default function ProductFilters({ isMobile = false, onClose }) {
  const dispatch = useDispatch();
  const { filters } = useSelector((s) => s.products);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 50000]);

  const toggle = (key, value) => {
    const arr = filters[key] || [];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    dispatch(setFilter({ [key]: next }));
  };

  const applyPrice = () => {
    dispatch(setFilter({ minPrice: priceRange[0], maxPrice: priceRange[1] }));
  };

  const SectionTitle = ({ title }) => (
    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
      {title}
    </h3>
  );

  const CheckChip = ({ label, active, onClick }) => (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${active ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'}`}>
      {label}
    </button>
  );

  const content = (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <SectionTitle title="Sort By" />
        <select
          value={filters.sort || '-createdAt'}
          onChange={(e) => dispatch(setFilter({ sort: e.target.value }))}
          className="input-field text-sm py-2"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Price */}
      <div>
        <SectionTitle title="Price Range" />
        <RangeSlider min={0} max={50000} value={priceRange} onChange={setPriceRange} onAfterChange={applyPrice} />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Fabric */}
      <div>
        <SectionTitle title="Fabric" />
        <div className="flex flex-wrap gap-2">
          {FABRICS.map((f) => (
            <CheckChip key={f} label={f} active={filters.fabric?.includes(f)} onClick={() => toggle('fabric', f)} />
          ))}
        </div>
      </div>

      {/* Occasion */}
      <div>
        <SectionTitle title="Occasion" />
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <CheckChip key={o} label={o} active={filters.occasion?.includes(o)} onClick={() => toggle('occasion', o)} />
          ))}
        </div>
      </div>

      {/* Work Type */}
      <div>
        <SectionTitle title="Work Type" />
        <div className="flex flex-wrap gap-2">
          {WORK_TYPES.map((w) => (
            <CheckChip key={w} label={w} active={filters.workType === w} onClick={() => dispatch(setFilter({ workType: filters.workType === w ? '' : w }))} />
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <SectionTitle title="Color" />
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button key={c.name} onClick={() => toggle('colors', c.name)} title={c.name}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${filters.colors?.includes(c.name) ? 'border-primary-500 ring-2 ring-primary-300 scale-110' : 'border-gray-300'}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <SectionTitle title="Min Rating" />
        <div className="flex gap-2">
          {[4, 3, 2, 1].map((r) => (
            <button key={r} onClick={() => dispatch(setFilter({ rating: filters.rating == r ? '' : r }))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${filters.rating == r ? 'bg-gold-500 border-gold-500 text-white' : 'border-gray-300 text-gray-600 hover:border-gold-400'}`}>
              <StarIcon className="w-3.5 h-3.5" />{r}+
            </button>
          ))}
        </div>
      </div>

      {/* Blouse Included */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={filters.blouseIncluded === 'true'}
            onChange={(e) => dispatch(setFilter({ blouseIncluded: e.target.checked ? 'true' : '' }))}
            className="w-4 h-4 accent-primary-500" />
          <span className="text-sm font-medium text-gray-700">Blouse Piece Included</span>
        </label>
      </div>

      {/* Reset */}
      <button onClick={() => dispatch(resetFilters())}
        className="w-full py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">
        Reset All Filters
      </button>
    </div>
  );

  if (isMobile) return (
    <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2"><FunnelIcon className="w-5 h-5 text-primary-600" /><span className="font-bold text-gray-900">Filters</span></div>
          <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
        </div>
        <div className="p-5">{content}</div>
      </motion.div>
    </div>
  );

  return <div className="w-64 shrink-0">{content}</div>;
}
