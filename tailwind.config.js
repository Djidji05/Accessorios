/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#0F172A",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        primary: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F8FAFC",
          foreground: "#0F172A",
        },
        border: "#E2E8F0",
        // Operator Brand Colors
        moncash: {
          DEFAULT: "#E11D48",
          light: "#FFE4E6",
        },
        natcash: {
          DEFAULT: "#0284C7",
          light: "#E0F2FE",
          accent: "#F59E0B",
        },
        digicel: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        natcom: {
          DEFAULT: "#0369A1",
          light: "#E0F2FE",
        },
        claro: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
        },
        altice: {
          DEFAULT: "#F97316",
          light: "#FFEDD5",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.25rem",
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'kravlo': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'kravlo-card': '0 0 0 1px rgba(226, 232, 240, 0.8), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'kravlo-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
