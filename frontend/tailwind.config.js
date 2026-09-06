/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#01B39F', // localcan green
          purple: '#A97DE7', // localcan purple
          green: '#4AB35A',
        },
        'surface': 'rgba(255, 255, 255, 0.03)',
        'surface-hover': 'rgba(255, 255, 255, 0.06)',
        'surface-border': 'rgba(255, 255, 255, 0.1)',
        'surface-border-hover': 'rgba(255, 255, 255, 0.2)',
        bg: {
          DEFAULT: '#0A0A0A',
          alt: '#111111',
          card: '#161616',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A8A29E', // stone-400
          muted: '#78716C', // stone-500
        },
        severity: {
          major: '#DC2626',
          'major-bg': 'rgba(220, 38, 38, 0.1)',
          'major-border': 'rgba(220, 38, 38, 0.3)',
          minor: '#D97706',
          'minor-bg': 'rgba(217, 119, 6, 0.1)',
          'minor-border': 'rgba(217, 119, 6, 0.3)',
        },
        border: 'rgba(255, 255, 255, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2rem, 1.5rem + 3vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '350' }],
        'h1': ['clamp(1.75rem, 1.5rem + 3vw, 3.125rem)', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '350' }],
        'h2': ['clamp(1.5rem, 1.3rem + 2.4vw, 2.625rem)', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '350' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '23': '5.75rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '70': '17.5rem',
        '90': '22.5rem',
      },
      maxWidth: {
        'content': '1140px',
        'narrow': '720px',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(0, 0, 0, 0.5)',
        'card': '0 8px 32px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow': '0 0 20px rgba(1, 179, 159, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'progress': 'progress 1.5s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(1, 179, 159, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(1, 179, 159, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
