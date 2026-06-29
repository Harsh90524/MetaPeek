/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: {
          0: '#f5f4f1',
          1: '#fafaf8',
          2: '#ffffff',
        },
        danger: {
          bg:     '#fef2f2',
          border: '#fecaca',
          text:   '#b91c1c',
        },
        warn: {
          bg:     '#fffbeb',
          border: '#fde68a',
          text:   '#92400e',
        },
        success: {
          bg:     '#f0fdf4',
          border: '#bbf7d0',
          text:   '#15803d',
        },
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
}
