
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-color)',
      },
      fontFamily: {
        sans: ['var(--app-font)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
