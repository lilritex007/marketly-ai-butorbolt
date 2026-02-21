/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Narancs - CTA, aktív állapot
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF8A00', // Main
          600: '#EA7600', // Hover
          700: '#C2590A',
          800: '#9A4510',
          900: '#7C3510',
        },
        // Secondary: Teal - Supporting, badge
        secondary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#006B6F', // Main
          600: '#005A5D', // Hover
          700: '#0D9488',
          800: '#115E59',
          900: '#134E4A',
        },
        // Feedback colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
      spacing: {
        // 8px alapegység
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
      },
      maxWidth: {
        '8xl': '1400px', // Container max
      },
      boxShadow: {
        // Perfect shadows
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'xl': '0 12px 40px rgba(0, 0, 0, 0.10)',
        '2xl': '0 16px 56px rgba(0, 0, 0, 0.12)',
        // Primary glow for CTA
        'primary': '0 4px 24px rgba(255, 138, 0, 0.35)',
        'primary-lg': '0 8px 32px rgba(255, 138, 0, 0.40)',
      },
      borderRadius: {
        'sm': '8px',
        'DEFAULT': '12px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      transitionDuration: {
        'DEFAULT': '200ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'ease-out',
      },
    },
  },
  plugins: [],
}
