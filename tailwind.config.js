/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    { pattern: /^(text|bg|ring)-(emerald|orange|amber|rose|blue|purple|cyan|indigo|pink)-(400|500)(\/\d+)?$/ },
    { pattern: /^ring-(emerald|orange|amber|rose|blue|purple|cyan|indigo|pink)-500\/\d+$/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
