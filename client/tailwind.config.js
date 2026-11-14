/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50, #eef2ff)',
          100: 'var(--brand-100, #e0e7ff)',
          200: 'var(--brand-200, #c7d2fe)',
          300: 'var(--brand-300, #a5b4fc)',
          400: 'var(--brand-400, #818cf8)',
          500: 'var(--brand-500, #6366f1)',
          600: 'var(--brand-600, #4f46e5)',
          700: 'var(--brand-700, #4338ca)',
          800: 'var(--brand-800, #3730a3)',
          900: 'var(--brand-900, #312e81)',
          950: 'var(--brand-950, #1e1b4b)'
        },
        accent: {
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 35px -5px rgba(99, 102, 241, 0.45)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-pattern': 'radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(217, 70, 239, 0.08) 0px, transparent 50%)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        shimmer: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '-200% 0' }
        }
      }
    }
  },
  plugins: []
};
