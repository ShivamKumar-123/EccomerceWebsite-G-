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
        /**
         * Design tokens
         * Primary #B87444 · hover #925C36 · accent #EADBC8 · bg #F8F7F5 · card #FFF
         * Text #1C1917 / #78716C · border #E7E5E4 · success / error / warning
         */
        background: '#F8F7F5',
        foreground: '#1C1917',
        card: '#FFFFFF',
        border: '#E7E5E4',
        muted: '#78716C',
        accent: '#EADBC8',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#F59E0B',
        primary: {
          DEFAULT: '#B87444',
          50: '#fdf9f6',
          100: '#f7ebe4',
          200: '#EADBC8',
          300: '#dcc4ae',
          400: '#c9986b',
          500: '#B87444',
          600: '#925C36',
          700: '#7a4d2d',
          800: '#5c3a22',
          900: '#3d2616',
          950: '#23160c',
        },
        /** Same ramp — many components use secondary-* for brand fills */
        secondary: {
          DEFAULT: '#B87444',
          50: '#fdf9f6',
          100: '#f7ebe4',
          200: '#EADBC8',
          300: '#dcc4ae',
          400: '#c9986b',
          500: '#B87444',
          600: '#925C36',
          700: '#7a4d2d',
          800: '#5c3a22',
          900: '#3d2616',
          950: '#23160c',
        },
        surface: {
          DEFAULT: '#1C1917',
          raised: '#292524',
          overlay: '#312e2a',
        },
        cta: {
          DEFAULT: '#FFFFFF',
          fg: '#1C1917',
        },
        dark: '#1C1917',
        light: '#F8F7F5',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(28,25,23,0.06), 0 8px 24px -4px rgba(28,25,23,0.08)',
        modern: '0 4px 24px -4px rgba(28,25,23,0.08), 0 12px 48px -12px rgba(184,116,68,0.12)',
        card: '0 1px 3px rgba(28,25,23,0.06), 0 12px 32px -8px rgba(28,25,23,0.1)',
        glow: '0 0 24px -4px rgba(184,116,68,0.35)',
        'glow-amber': '0 0 24px -4px rgba(184,116,68,0.4)',
        glass: '0 8px 32px rgba(28,25,23,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        premium: '0 4px 6px -1px rgba(28,25,23,0.07), 0 20px 60px -12px rgba(184,116,68,0.15)',
        'premium-dark': '0 4px 6px -1px rgba(0,0,0,0.4), 0 20px 60px -12px rgba(0,0,0,0.55)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(184,116,68,0.12), transparent), radial-gradient(ellipse 80% 60% at 100% 60%, rgba(184,116,68,0.06), transparent), radial-gradient(ellipse 60% 50% at 0% 80%, rgba(234,219,200,0.35), transparent)',
        'hero-mesh-dark':
          'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(184,116,68,0.18), transparent), radial-gradient(ellipse 80% 60% at 100% 60%, rgba(184,116,68,0.08), transparent), radial-gradient(ellipse 60% 50% at 0% 80%, rgba(255,255,255,0.04), transparent)',
        'gradient-brand': 'linear-gradient(135deg, #1C1917 0%, #3d2616 45%, #B87444 100%)',
        'gradient-hero': 'linear-gradient(145deg, #F8F7F5 0%, #ffffff 50%, #F8F7F5 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,247,245,0.98) 100%)',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(28,25,23,0.04) 50%, transparent 100%)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        gradient: 'gradientShift 6s ease infinite',
        'slide-up': 'slideUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(184,116,68,0.3)' },
          '50%': { boxShadow: '0 0 40px -4px rgba(184,116,68,0.5)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
