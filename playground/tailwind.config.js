/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.vue',
  ],
  theme: {
    extend: {
      spacing: {
        '8xl': '96rem',
      },
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
        longImage: '12 / 16',
      },
    },
  },
  plugins: [],
}
