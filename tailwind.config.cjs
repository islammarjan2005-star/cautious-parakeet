/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'navy': '#1a2744',
        'navy-dark': '#0d1b2a',
        'navy-light': '#243b5e',
        'navy-mid': '#1e3050',
        'steel': '#C0C8D4',
        'steel-dark': '#8A94A4',
        'steel-light': '#D8DEE6',
        'accent': '#FFD600',
        'accent-dark': '#C6A800',
        'action-red': '#D32F2F',
        'action-red-dark': '#9A0007',
        'danger': '#FF5252',
        'danger-dark': '#C62828',
        'success': '#69F0AE',
        'success-dark': '#2E7D32',
        'game-text': '#1A1A2E',
        'game-text-light': '#6B7280',
      },
      fontFamily: {
        'display': ['"Fredoka One"', 'cursive'],
        'sans': ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '999px',
      },
      boxShadow: {
        'chunky': '0 6px 0 rgba(0,0,0,0.3)',
        'chunky-sm': '0 4px 0 rgba(0,0,0,0.2)',
        'chunky-yellow': '0 4px 0 #C6A800',
        'chunky-red': '0 4px 0 #9A0007',
        'chunky-green': '0 4px 0 #2E7D32',
        'chunky-blue': '0 4px 0 #0288D1',
        'chunky-orange': '0 4px 0 #E64A19',
        'glow-yellow': '0 0 0 4px #FFD600',
        'glow-green': '0 0 0 4px #69F0AE',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.08)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'confetti': 'confettiFall 3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}
