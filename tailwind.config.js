/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_pages/**/*.html',
    './_posts/**/*.md',
    './_posts/**/*.html',
    '*.html',
    './*.html',
    './**/*.html',
  ],
  content: [],
  theme: {
    colors: {
      white: '#FFFFFF',
      fuschia60: '#FCDDEC',
      primaryBG: '#141035',
      secondaryBG: '#1A1B2A',
      primaryText: '#141035',
      secondaryText: '#5E5E5E',
      tertiaryText: '#CBCCCE',
      btnPrimary: '#5D5FEF',
      btnSecondary: 'rgba(93, 95, 239, 0.20)',
      'white-alpha-20': 'rgba(255, 255, 255, 0.2)',
      'white-alpha-25': 'rgba(255, 255, 255, 0.25)'
    },
    extend: {},
  },
  plugins: [],
}

