import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-ivory flex flex-col items-center justify-center z-[999]">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-medium uppercase tracking-[0.32em] pl-[0.32em]">
          Saree<span className="text-gold-600">Bazaar</span>
        </h1>
        <div className="mx-auto mt-6 h-px w-24 bg-gray-200 overflow-hidden">
          <div className="h-full w-1/2 bg-gold-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
