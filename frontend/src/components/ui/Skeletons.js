import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="space-y-3 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-4/5 rounded" />
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
      <div className="flex gap-4">
        <div className="skeleton w-16 h-16 rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 py-8">
      <div className="skeleton h-8 w-64 rounded mx-auto" />
      <div className="skeleton h-4 w-48 rounded mx-auto" />
    </div>
  );
}
