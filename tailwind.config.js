/** @type {import('tailwindcss').Config} */

// Every colour resolves to a token in _assets/css/tokens.css; no hex here.
// `<alpha-value>` keeps opacity modifiers (bg-navy/80) working.
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

module.exports = {
  content: [
    './layouts/**/*.html',
    './content/**/*.{html,md}',
  ],
  theme: {
    // Replace, not extend, the default palette: the brand palette is the
    // only one available, so an off-brand indigo-500 cannot creep back in.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: token('white'),
      black: 'rgb(0 0 0 / <alpha-value>)',

      // Primitives
      navy: {
        DEFAULT: token('navy-100'),
        100: token('navy-100'),
        80: token('navy-80'),
        60: token('navy-60'),
        40: token('navy-40'),
        20: token('navy-20'),
        10: token('navy-10'),
        5: token('navy-5'),
      },
      mist: {
        DEFAULT: token('mist'),
        50: token('mist-50'),
      },
      orange: {
        DEFAULT: token('orange-500'),
        800: token('orange-800'),
        700: token('orange-700'),
        600: token('orange-600'),
        500: token('orange-500'),
        300: token('orange-300'),
        100: token('orange-100'),
        50: token('orange-50'),
      },
      success: { DEFAULT: token('success-full'), tint: token('success-tint') },
      danger: { DEFAULT: token('danger-full'), tint: token('danger-tint') },
      warning: { DEFAULT: token('warning-full'), tint: token('warning-tint') },
      info: { DEFAULT: token('info-full'), tint: token('info-tint') },

      // Roles
      canvas: token('canvas'),
      surface: {
        DEFAULT: token('surface'),
        strong: token('surface-strong'),
      },
      line: {
        DEFAULT: token('line'),
        strong: token('line-strong'),
      },
      ink: {
        DEFAULT: token('ink'),
        muted: token('ink-muted'),
        subtle: token('ink-subtle'),
      },
      inverse: {
        DEFAULT: token('inverse'),
        raised: token('inverse-raised'),
      },
      'on-inverse': {
        DEFAULT: token('on-inverse'),
        muted: token('on-inverse-muted'),
        subtle: token('on-inverse-subtle'),
      },
      accent: {
        DEFAULT: token('accent'),
        strong: token('accent-strong'),
        hover: token('accent-hover'),
        soft: token('accent-soft'),
      },
      'on-accent': token('on-accent'),
      focus: {
        DEFAULT: token('focus'),
        inverse: token('focus-inverse'),
      },
      code: {
        bg: token('code-bg'),
        text: token('code-text'),
        string: token('code-string'),
        muted: token('code-muted'),
      },
    },
    extend: {
      // Default for a bare `border` / `divide-*`, which Tailwind otherwise
      // takes from the gray palette removed above. The bare `ring` default
      // is set in _assets/css/tailwind.css.
      borderColor: {
        DEFAULT: token('line'),
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      letterSpacing: {
        display: 'var(--tracking-display)',
        heading: 'var(--tracking-heading)',
        eyebrow: 'var(--tracking-eyebrow)',
      },
      lineHeight: {
        display: 'var(--leading-display)',
        heading: 'var(--leading-heading)',
        body: 'var(--leading-body)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
      },
    },
  },
  plugins: [],
}
