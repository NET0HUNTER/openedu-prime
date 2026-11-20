/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './client/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--oe-font-family, "Rubik", system-ui, sans-serif)'],
      },
      colors: {
        oe: {
          primary: 'var(--oe-brand-primary)',
          primaryDark: 'var(--oe-brand-primary-dark)',
          accent: 'var(--oe-brand-accent)',
          gold: 'var(--oe-brand-gold)',
          coral: 'var(--oe-card-coral)',
          periwinkle: 'var(--oe-card-periwinkle)',
          cream: 'var(--oe-surface-cream)',
          paleBlue: 'var(--oe-surface-pale-blue)',
          workspace: 'var(--oe-bg-workspace)',
        },
      },
    },
  },
  plugins: [],
};
