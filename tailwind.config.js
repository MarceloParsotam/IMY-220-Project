/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        dark: 'var(--dark)',
        light: 'var(--light)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        gray: {
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
        text: {
          primary: 'var(--text-primary)',
        },
        border: 'var(--border-color)',
        bg: {
          secondary: 'var(--bg-secondary)',
        },
        card: {
          bg: 'var(--card-bg)',
        }
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Tahoma',
          'Geneva',
          'Verdana',
          'sans-serif'
        ],
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      },
      boxShadow: {
        DEFAULT: 'var(--box-shadow)',
        card: 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
      },
      transitionProperty: {
        'all': 'all',
      },
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease': 'ease',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, var(--dark), #16213e)',
      }
    },
  },
  plugins: [],
}