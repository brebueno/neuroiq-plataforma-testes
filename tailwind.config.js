/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#12A08C',
          dark: '#0C7E6E',
          light: '#EAF7F1',
        },
        ink: '#12203B',
      },
      keyframes: {
        qmFloat: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        qmMarquee: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        qmFloat: 'qmFloat 6.5s ease-in-out infinite',
        qmMarquee: 'qmMarquee linear infinite',
      },
    },
  },
  plugins: [],
};
