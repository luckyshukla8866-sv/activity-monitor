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
        "primary-dim": "#004ca5",
        "on-secondary-fixed-variant": "#2c48ac",
        "on-tertiary-fixed-variant": "#6d2178",
        "outline-variant": "#a8aeb4",
        "on-tertiary-container": "#62156e",
        "error-container": "#fb5151",
        "on-secondary": "#f2f1ff",
        "surface-container": "#e2e9f1",
        "inverse-surface": "#090f14",
        "on-tertiary": "#ffeefb",
        "tertiary": "#883c93",
        "error-dim": "#9f0519",
        "tertiary-fixed": "#f79ffe",
        "on-background": "#2a2f35",
        "surface-container-highest": "#d6dee7",
        "surface-tint": "#0058bc",
        "on-surface-variant": "#565c62",
        "surface-variant": "#d6dee7",
        "primary-fixed-dim": "#5291ff",
        "primary": "#0058bc",
        "background": "#f2f7fe",
        "tertiary-fixed-dim": "#e891ef",
        "on-secondary-fixed": "#00288e",
        "secondary-fixed-dim": "#b4c1ff",
        "surface-container-high": "#dce3ec",
        "surface-container-lowest": "#ffffff",
        "outline": "#72777e",
        "on-primary-fixed-variant": "#002a61",
        "primary-container": "#6d9fff",
        "on-secondary-container": "#213ea2",
        "on-primary-fixed": "#000000",
        "on-error": "#ffefee",
        "inverse-primary": "#4c8eff",
        "secondary": "#3953b7",
        "error": "#b31b25",
        "surface-dim": "#ccd5df",
        "surface-bright": "#f2f7fe",
        "tertiary-dim": "#7b2f86",
        "inverse-on-surface": "#989da4",
        "on-error-container": "#570008",
        "secondary-fixed": "#c7cfff",
        "secondary-dim": "#2b47ab",
        "surface-container-low": "#ebf1f9",
        "primary-fixed": "#6d9fff",
        "on-primary": "#f0f2ff",
        "secondary-container": "#c7cfff",
        "on-tertiary-fixed": "#460051",
        "tertiary-container": "#f79ffe",
        "on-surface": "#2a2f35",
        "surface": "#f2f7fe",
        "on-primary-container": "#00214f"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Manrope"],
        "body": ["Manrope"],
        "label": ["Manrope"]
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
