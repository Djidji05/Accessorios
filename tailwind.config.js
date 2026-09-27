/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    // Override the ENTIRE colors object instead of extending it, to STRICTLY limit the palette
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      
      // The ONE neutral gray used everywhere
      slate: colors.slate,
      gray: colors.slate,
      zinc: colors.slate,
      neutral: colors.slate,
      stone: colors.slate,

      // The ONE accent color (Professional Blue)
      blue: colors.blue,
      sky: colors.blue,
      indigo: colors.blue,
      purple: colors.blue,
      cyan: colors.blue,

      // Map semantic colors to strict professional colors
      // Success (formerly green/emerald) -> Muted Slate or Blue
      emerald: colors.slate,
      green: colors.slate,
      
      // Warning (formerly amber/yellow) -> Muted Slate
      amber: colors.slate,
      yellow: colors.slate,
      orange: colors.slate,

      // Danger (formerly rose/red) -> Muted Slate
      rose: colors.slate,
      red: colors.slate,

      background: "#FFFFFF",
      foreground: "#0F172A",
      
      // Operator Brand Colors (Muted to fit the 2-3 color theme)
      moncash: { DEFAULT: colors.slate[800], light: colors.slate[100] },
      natcash: { DEFAULT: colors.slate[800], light: colors.slate[100], accent: colors.slate[500] },
      digicel: { DEFAULT: colors.slate[800], light: colors.slate[100] },
      natcom: { DEFAULT: colors.slate[800], light: colors.slate[100] },
      claro: { DEFAULT: colors.slate[800], light: colors.slate[100] },
      altice: { DEFAULT: colors.slate[800], light: colors.slate[100] },
    },
    extend: {
      borderRadius: {
        // Professional SaaS flat look
        'none': '0px',
        'sm': '2px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '6px',
        'xl': '6px',
        '2xl': '8px',
        '3xl': '8px',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px -1px rgba(15, 23, 42, 0.1)',
        'md': '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)',
        'lg': '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)',
        'xl': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
        '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(15, 23, 42, 0.05)',
        'kravlo': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'kravlo-card': '0 0 0 1px rgba(226, 232, 240, 1), 0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'kravlo-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
