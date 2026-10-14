/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nac: {
          dark: '#0A1128',
          navy: '#001F54',
          primary: '#034078',
          accent: '#1282A2',
          light: '#F8FAFC',
          gold: '#D97706',
          emerald: '#059669'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(3, 64, 120, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(5, 150, 105, 0.3)',
        'glow-gold': '0 0 25px -5px rgba(217, 119, 6, 0.3)',
      }
    },
  },
  plugins: [],
}
