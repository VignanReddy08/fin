/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        card: '#171717',
        primary: '#2563EB',
        success: '#10B981',
        pending: '#F59E0B',
        destructive: '#EF4444',
        muted: '#262626',
        border: '#333333'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
