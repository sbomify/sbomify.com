/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_pages/**/*.html',
    './_posts/**/*.md',
    './_posts/**/*.html',
    './*.md',
    '*.html',
    './*.html',
    './**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        fuschia60: '#FCDDEC',
        primaryBG: '#141035',
        secondaryBG: '#1A1B2A',
        primaryText: '#141035',
        secondaryText: '#5E5E5E',
        tertiaryText: '#CBCCCE',
        purple: {
          DEFAULT: '#8A7DFF',
          700: '#7A6DE5',
        },
        primary: {
          DEFAULT: '#141035',
          light: '#201B4C',
          600: '#37306B',
          700: '#4A4276',
        }
      },
    },
  },
  plugins: [],
}

