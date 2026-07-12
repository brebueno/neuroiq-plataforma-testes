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
        qmRise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        qmConfetti: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(var(--r,720deg))', opacity: '0' },
        },
      },
      animation: {
        qmFloat: 'qmFloat 6.5s ease-in-out infinite',
        qmMarquee: 'qmMarquee linear infinite',
        qmRise: 'qmRise 0.45s cubic-bezier(0.16,1,0.3,1) both',
        qmConfetti: 'qmConfetti 1.8s ease-in forwards',
      },
    },
  },
  plugins: [],
};
