/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
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
          DEFAULT: '#C5A059',
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
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(197, 160, 89, 0.2)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
