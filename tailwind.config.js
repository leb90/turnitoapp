/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Aquí aseguramos que busque en todos los archivos de TypeScript y React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}