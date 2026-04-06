import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Primary (Electric Blue) ─────────────────── */
        "primary": "#2444eb",
        "primary-dim": "#0934e0",
        "primary-container": "#8999ff",
        "primary-fixed": "#8999ff",
        "primary-fixed-dim": "#778aff",
        "on-primary": "#f3f1ff",
        "on-primary-container": "#001470",
        "on-primary-fixed": "#000000",
        "on-primary-fixed-variant": "#001a88",
        
        /* ── Secondary (Soft Indigo) ─────────────────── */
        "secondary": "#4647d3",
        "secondary-dim": "#3939c7",
        "secondary-container": "#cdcdff",
        "secondary-fixed": "#cdcdff",
        "secondary-fixed-dim": "#bdbeff",
        "on-secondary": "#f4f1ff",
        "on-secondary-container": "#2f2ebf",
        "on-secondary-fixed": "#160bae",
        "on-secondary-fixed-variant": "#3a3ac8",

        /* ── Tertiary (Magenta) ──────────────────────── */
        "tertiary": "#93387f",
        "tertiary-dim": "#842b72",
        "tertiary-container": "#f98fdc",
        "tertiary-fixed": "#f98fdc",
        "tertiary-fixed-dim": "#ea82ce",
        "on-tertiary": "#ffeef6",
        "on-tertiary-container": "#600653",
        "on-tertiary-fixed": "#390030",
        "on-tertiary-fixed-variant": "#6c135c",

        /* ── Error ───────────────────────────────────── */
        "error": "#b41340",
        "error-dim": "#a70138",
        "error-container": "#f74b6d",
        "on-error": "#ffefef",
        "on-error-container": "#510017",

        /* ── Surface System ──────────────────────────── */
        "background": "#f5f7f9",
        "on-background": "#2c2f31",
        "surface": "#f5f7f9",
        "surface-bright": "#f5f7f9",
        "surface-dim": "#d0d5d8",
        "surface-tint": "#2444eb",
        "surface-variant": "#d9dde0",
        "surface-container": "#e5e9eb",
        "surface-container-high": "#dfe3e6",
        "surface-container-highest": "#d9dde0",
        "surface-container-low": "#eef1f3",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#2c2f31",
        "on-surface-variant": "#595c5e",

        /* ── Outline ─────────────────────────────────── */
        "outline": "#747779",
        "outline-variant": "#abadaf",

        /* ── Inverse ─────────────────────────────────── */
        "inverse-surface": "#0b0f10",
        "inverse-on-surface": "#9a9d9f",
        "inverse-primary": "#7387ff",
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"],
        "manrope": ["Manrope", "sans-serif"],
        "inter": ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
