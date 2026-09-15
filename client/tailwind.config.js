/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'death-black': '#07070a',
        'death-surface': '#0e0f17',
        'death-card': '#151622',
        'death-border': '#25273a',
        'kira-red': '#e50914',
        'kira-glow': '#ff1a26',
        'kira-dark': '#8b0000',
        'l-cyan': '#00e5ff',
        'l-green': '#00ff88',
        'parchment': '#e5ded3',
        'parchment-muted': '#a8a29e'
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'crimson': '0 0 25px -5px rgba(229, 9, 20, 0.4)',
        'l-glow': '0 0 25px -5px rgba(0, 229, 255, 0.3)'
      }
    },
  },
  plugins: [],
}
