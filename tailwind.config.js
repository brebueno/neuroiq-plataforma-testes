/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#12A08C',
          dark: '#0C7E6E',
          light: '#EAF7F1',
        },
        ink: '#12203B',
      },
    },
  },
  plugins: [],
};
