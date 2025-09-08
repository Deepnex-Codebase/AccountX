/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#408DFB',    // Sky Blue - CTA buttons, links, highlights
        'base-dark': '#21263C', // Deep Navy - Header, sidebar text
        background: '#F7F7FE',  // Light Lavender Mist - Page backgrounds, light sections
        surface: '#FFFFFF',     // White - Cards, containers
        muted: '#6E7280',       // Cool Gray - Labels, helper text
        success: '#30B37C',     // Fresh Green - Status tags, success messages
        error: '#F3736C',       // Coral Red - Validation errors, alerts
      },
      fontFamily: {
        figtree: ['Figtree', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'card': '12px',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fadeIn': 'fadeIn 0.2s ease-out',
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
    },
  },
  plugins: [],
}