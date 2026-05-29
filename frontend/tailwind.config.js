/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003366',
        accent: '#C8A000',
        surface: '#F5F7FA',
        approved: '#027A48',
        escalated: '#B45309',
      },
      fontFamily: {
        arabic: ['"Geeza Pro"', '"Noto Naskh Arabic"', '"Arabic Typesetting"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
