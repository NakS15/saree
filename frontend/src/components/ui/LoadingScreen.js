import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[999]">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🪡</div>
        <h1 className="font-serif text-2xl font-bold">
          <span className="text-primary-600">Saree</span>
          <span className="text-gold-600">Bazaar</span>
        </h1>
        <div className="flex justify-center gap-1.5 mt-5">
          {[0,1,2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
