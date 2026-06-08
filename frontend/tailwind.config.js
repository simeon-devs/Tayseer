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
        gold: {
          DEFAULT: '#8E702E',
          dark: '#7A5E24',
          light: '#FAF9F6',
          sidebar: '#F4F2EB',
          border: '#E5DFD3',
          badge: '#FBF9F4',
        },
      },
      fontFamily: {
        arabic: ['"Geeza Pro"', '"Noto Naskh Arabic"', '"Arabic Typesetting"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
