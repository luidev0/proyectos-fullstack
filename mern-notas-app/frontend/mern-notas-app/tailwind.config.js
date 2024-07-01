/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00B4D8",
        secondary: "#e5e5e5"        
      }
    },
  },
  plugins: [],
}