/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#166534',
        secondary: '#ca8a04',
        dark: '#1a1a1a',
        light: '#faf8f5',
        flipkart: {
          DEFAULT: '#2874f0',
          dark: '#1a5f9e',
          bg: '#f1f3f6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 8px 24px -4px rgba(15, 23, 42, 0.08)',
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 12px 32px -8px rgba(22, 101, 52, 0.12)',
      },
    },
  },
  plugins: [],
}
