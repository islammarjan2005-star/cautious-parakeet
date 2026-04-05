/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gold': '#C9A84C',
        'gold-light': '#D4BC6A',
        'gold-dark': '#A8893A',
        'ivory': '#FAFAF5',
        'ivory-dark': '#F0EDE4',
        'walnut': '#1a0e08',
        'walnut-light': '#2a1810',
        'panel': 'rgba(0,0,0,0.6)',
        'panel-light': 'rgba(255,255,255,0.04)',
        'panel-border': 'rgba(255,255,255,0.08)',
        'text-primary': '#E8E4DC',
        'text-muted': '#8A8278',
        'text-card': '#1a1a1a',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)',
        'card-selected': '0 8px 20px rgba(0,0,0,0.35), 0 0 0 1px #C9A84C',
        'panel': '0 2px 8px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
