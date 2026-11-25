/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    // Square, editorial geometry; only avatars/pills stay round.
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '9999px',
    },
    extend: {
      colors: {
        // Warm stone neutrals replace Tailwind's cool grays site-wide.
        gray: {
          50:  '#faf8f5',
          100: '#f3efe9',
          200: '#e7e1d8',
          300: '#d3cbbe',
          400: '#a39b8e',
          500: '#7a7367',
          600: '#5c564c',
          700: '#403b34',
          800: '#2a2621',
          900: '#1a1714',
        },
        // Oxblood / wine
        primary: {
          50:  '#f9f1f1',
          100: '#f0dede',
          200: '#e0bdbe',
          300: '#c58f92',
          400: '#a25b61',
          500: '#7a2e38',
          600: '#651f2a',
          700: '#52171f',
          800: '#3d1117',
          900: '#2a0b10',
        },
        // Antique brass
        gold: {
          50:  '#fbf8f1',
          100: '#f4eddc',
          200: '#e8dab8',
          300: '#d6bf8a',
          400: '#bfa06a',
          500: '#a48450',
          600: '#86683a',
          700: '#684f2c',
        },
        ethnic: {
          maroon: '#52171f',
          deep:   '#2a0b10',
          cream:  '#f4efe6',
          silk:   '#ece4d6',
        },
        ivory: '#faf7f2',
        ink:   '#161311',
      },
      fontFamily: {
        sans:  ['Jost', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        md: '0 1px 3px rgba(22,19,17,0.06)',
        lg: '0 12px 32px -14px rgba(22,19,17,0.14)',
        xl: '0 28px 56px -24px rgba(22,19,17,0.22)',
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
        'saree-gradient': 'linear-gradient(135deg, #2a0b10 0%, #52171f 55%, #86683a 100%)',
        shimmer:          'linear-gradient(90deg, #f3efe9 25%, #e7e1d8 50%, #f3efe9 75%)',
      },
    },
  },
  plugins: [],
};
