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
      tertiaryText: '#CBCCCE'
    },
    extend: {},
  },
  plugins: [],
}

