// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#FAF6F0',
          text: '#2D2420',
          accent: '#C45D3C',
          sage: '#7A8B6F',
          coral: '#E06C53',
          card: '#F5EFE6',
          'accent-light': '#F6E6E1',
          'sage-light': '#ECEFEA',
          'coral-light': '#FAEBE7',
        }
      },
      boxShadow: {
        brand: '0 4px 20px -2px rgba(45, 36, 32, 0.08)',
        'brand-hover': '0 10px 25px -3px rgba(45, 36, 32, 0.12)',
      }
    },
  },
  plugins: [],
};
