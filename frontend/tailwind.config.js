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
        primary: '#1a5f2a',
        secondary: '#f5a623',
        dark: '#1a1a1a',
        light: '#f8f9fa',
        flipkart: {
          DEFAULT: '#2874f0',
          dark: '#1a5f9e',
          bg: '#f1f3f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
