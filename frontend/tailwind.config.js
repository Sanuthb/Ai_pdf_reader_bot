/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
          primaryFontFamily:'sans-serif',
      },
      colors:{
        primary: '#a026ff',
        secondary: '#212121',
      }
    },
  },
  plugins: [],
}