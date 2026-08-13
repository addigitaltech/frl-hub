import type { Config } from 'tailwindcss';

// These map onto the CSS custom properties set in app/globals.css / applied
// dynamically from Settings in app/layout.tsx, so admin UI built with
// Tailwind utilities (bg-frl-green, text-muted, etc.) and the existing
// hand-written public-site CSS stay visually consistent.
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'frl-green': 'var(--green)',
        'frl-green-dark': 'var(--green-dark)',
        'frl-orange': 'var(--orange)',
        'frl-blue': 'var(--blue)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
      },
    },
  },
  plugins: [],
} satisfies Config;
