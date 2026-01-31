/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Primary: Orange #ff8a00
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff8a00',
          600: '#ea7600',
          700: '#c2590a',
          800: '#9a4510',
          900: '#7c3510',
          950: '#431a03',
        },
        // Secondary: Teal #006b6f
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#006b6f',
          800: '#005a5d',
          900: '#004a4d',
          950: '#002e30',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
      spacing: {
        section: '2rem',
        'section-md': '3rem',
      },
    },
  },
  plugins: [],
}

