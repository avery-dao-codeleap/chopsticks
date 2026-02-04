/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#f97316', // Orange
        background: '#0a0a0a',
        card: '#171717',
        border: '#262626',
      },
    },
  },
  plugins: [],
};
