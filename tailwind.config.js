/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#FDFBF7',
          dark: '#F5F2EA',
        },
        cream: {
          light: '#FFFDF9',
          DEFAULT: '#FFFBF2',
          dark: '#F9F4E8',
        },
        gold: {
          light: '#D4B886',
          DEFAULT: '#C5A059', // Primary Gold
          dark: '#A68344',
        },
        leather: {
          light: '#8D6E63',
          DEFAULT: '#5D4037',
          dark: '#3E2723',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // For premium feel
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(197, 160, 89, 0.2)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
