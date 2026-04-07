/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#667EEA',
        'primary-dark': '#5A6FD1',
        'primary-light': '#8B9DF0',
        'secondary': '#764BA2',
        'accent': '#FFD600',
        'accent-dark': '#C6A800',
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
        'chunky': '0 6px 0 rgba(0,0,0,0.2)',
        'chunky-sm': '0 4px 0 rgba(0,0,0,0.15)',
        'chunky-yellow': '0 4px 0 #C6A800',
        'chunky-red': '0 4px 0 #C62828',
        'chunky-green': '0 4px 0 #2E7D32',
        'chunky-blue': '0 4px 0 #0288D1',
        'chunky-orange': '0 4px 0 #E64A19',
        'glow-yellow': '0 0 0 4px #FFD600',
        'glow-green': '0 0 0 4px #69F0AE',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'gradient': 'gradientShift 8s ease infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'confetti': 'confettiFall 3s ease-in-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
