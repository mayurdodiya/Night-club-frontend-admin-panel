/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        surface: '#15151f',
        elevated: '#1e1e2a',
      },
      boxShadow: {
        glow: '0 0 20px rgba(217, 70, 239, 0.35)',
        'glow-gold': '0 0 30px rgba(245, 158, 11, 0.45)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, 6%) scale(1.1)' },
          '66%': { transform: 'translate(-3%, -4%) scale(0.95)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '0.15' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        spotlightA: {
          '0%, 100%': { transform: 'rotate(-18deg)' },
          '50%': { transform: 'rotate(18deg)' },
        },
        spotlightB: {
          '0%, 100%': { transform: 'rotate(18deg)' },
          '50%': { transform: 'rotate(-18deg)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh)', opacity: '0' },
        },
        dialogShow: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'drift-slow': 'drift 18s ease-in-out infinite',
        'drift-med': 'drift 13s ease-in-out infinite',
        'drift-fast': 'drift 9s ease-in-out infinite',
        sweep: 'sweep 6s ease-in-out infinite',
        'spotlight-a': 'spotlightA 6s ease-in-out infinite',
        'spotlight-b': 'spotlightB 7s ease-in-out infinite',
        'float-up': 'floatUp linear infinite',
        'dialog-in': 'dialogShow 0.18s ease-out',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
