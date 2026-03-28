/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff0f0',
          100: '#ffd6d6',
          200: '#ffadad',
          300: '#ff7070',
          400: '#ff3d3d',
          500: '#c41e3a',   // SareeBazaar red
          600: '#a51830',
          700: '#8b1a1a',
          800: '#6b1515',
          900: '#4a0e0e',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d97706',   // Saree gold
          600: '#b45309',
          700: '#92400e',
        },
        ethnic: {
          maroon: '#800000',
          deep:   '#4a0e0e',
          cream:  '#fdf6e3',
          silk:   '#f5e6d3',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'zoom-in':    'zoomIn 0.2s ease-out',
        shimmer:      'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideDown: { from: { transform: 'translateY(-20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        zoomIn:    { from: { transform: 'scale(0.95)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'hero-pattern':   "url('/assets/hero-bg.jpg')",
        'saree-gradient': 'linear-gradient(135deg, #c41e3a 0%, #8b1a1a 50%, #d97706 100%)',
        shimmer:          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      },
    },
  },
  plugins: [],
};
