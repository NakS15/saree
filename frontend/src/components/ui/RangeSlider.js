import React from 'react';

export default function RangeSlider({ min, max, value, onChange, onAfterChange }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Min</label>
          <input
            type="number" min={min} max={value[1] - 100}
            value={value[0]}
            onChange={(e) => onChange([+e.target.value, value[1]])}
            onBlur={onAfterChange}
            className="input-field text-sm py-2"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Max</label>
          <input
            type="number" min={value[0] + 100} max={max}
            value={value[1]}
            onChange={(e) => onChange([value[0], +e.target.value])}
            onBlur={onAfterChange}
            className="input-field text-sm py-2"
          />
        </div>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-2 bg-primary-500 rounded-full"
          style={{ left: `${(value[0]/max)*100}%`, right: `${100-(value[1]/max)*100}%` }}
        />
      </div>
    </div>
  );
}
