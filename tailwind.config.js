/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0a0f2e',
        'navy-light': '#111936',
        slate: '#1e2a4a',
        'slate-light': '#2a3a5c',
        cyan: '#06b6d4',
        'cyan-light': '#22d3ee',
        'text-primary': '#f0f4ff',
        'text-secondary': '#94a3b8',
        green: '#10b981',
        yellow: '#f59e0b',
        orange: '#f97316',
        red: '#ef4444',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
