/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/src/**/*.{html,ts}',
    './libs/**/src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        dark: '#0d47a1',
        accent: '#ff6f00',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
