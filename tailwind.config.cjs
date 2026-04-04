/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'md-red': '#E53935',
        'md-blue': '#1E88E5',
        'md-green': '#43A047',
        'md-yellow': '#FDD835',
        'md-orange': '#FB8C00',
        'md-purple': '#8E24AA',
        'md-brown': '#6D4C41',
        'md-teal': '#00897B',
        'md-pink': '#D81B60',
        'md-sky': '#039BE5',
        'md-gold': '#FFB300',
        'felt': '#1a5c2a',
        'felt-dark': '#0f3d1a',
        'felt-light': '#2a7c3a',
      },
      fontFamily: {
        'mono': ['Monopoly', 'Georgia', 'serif'],
        'game': ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shake': 'shake 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'card-draw': 'cardDraw 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        cardDraw: {
          '0%': { transform: 'translateY(-100px) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)',
        'card-active': '0 12px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.3)',
        'neon': '0 0 10px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
