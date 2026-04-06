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
        /* ── Primary (Deep Indigo) ────────────────── */
        "primary": "#4f46e5",
        "primary-dim": "#4338ca",
        "primary-container": "#c7d2fe",
        "primary-fixed": "#c7d2fe",
        "primary-fixed-dim": "#a5b4fc",
        "on-primary": "#ffffff",
        "on-primary-container": "#312e81",
        "on-primary-fixed": "#1e1b4b",
        "on-primary-fixed-variant": "#3730a3",
        
        /* ── Secondary (Electric Purple) ─────────── */
        "secondary": "#7c3aed",
        "secondary-dim": "#6d28d9",
        "secondary-container": "#ddd6fe",
        "secondary-fixed": "#ddd6fe",
        "secondary-fixed-dim": "#c4b5fd",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#4c1d95",
        "on-secondary-fixed": "#2e1065",
        "on-secondary-fixed-variant": "#5b21b6",

        /* ── Tertiary (Vibrant Fuchsia) ──────────── */
        "tertiary": "#a855f7",
        "tertiary-dim": "#9333ea",
        "tertiary-container": "#f5d0fe",
        "tertiary-fixed": "#f5d0fe",
        "tertiary-fixed-dim": "#e9a8fa",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#701a75",
        "on-tertiary-fixed": "#4a044e",
        "on-tertiary-fixed-variant": "#7e22ce",

        /* ── Error ───────────────────────────────── */
        "error": "#dc2626",
        "error-dim": "#b91c1c",
        "error-container": "#fecaca",
        "on-error": "#ffffff",
        "on-error-container": "#7f1d1d",

        /* ── Surface System ──────────────────────── */
        "background": "#f0f2f5",
        "on-background": "#1a1d21",
        "surface": "#f0f2f5",
        "surface-bright": "#f5f7fa",
        "surface-dim": "#c8cdd2",
        "surface-tint": "#4f46e5",
        "surface-variant": "#d4d8dd",
        "surface-container": "#e0e4e8",
        "surface-container-high": "#dadee2",
        "surface-container-highest": "#d4d8dd",
        "surface-container-low": "#e8ebef",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#1a1d21",
        "on-surface-variant": "#4b5563",

        /* ── Outline ─────────────────────────────── */
        "outline": "#6b7280",
        "outline-variant": "#9ca3af",

        /* ── Inverse ─────────────────────────────── */
        "inverse-surface": "#111827",
        "inverse-on-surface": "#d1d5db",
        "inverse-primary": "#818cf8",

        /* ── Accent Helpers ──────────────────────── */
        "accent-emerald": "#10b981",
        "accent-amber": "#f59e0b",
        "accent-rose": "#f43f5e",
        "accent-sky": "#0ea5e9",
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
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.7s ease-out forwards",
        "slide-in": "slideIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "floatSlow 12s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "morph-blob": "morphBlob 10s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "border-glow": "borderGlow 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(1deg)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "25%": { transform: "translateY(-20px) translateX(10px)" },
          "50%": { transform: "translateY(-10px) translateX(-5px)" },
          "75%": { transform: "translateY(-25px) translateX(15px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(79,70,229,0.1), 0 0 60px rgba(79,70,229,0.05)" },
          "50%": { boxShadow: "0 0 40px rgba(79,70,229,0.25), 0 0 80px rgba(79,70,229,0.1)" },
        },
        morphBlob: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 50% 40% 60% / 40% 50% 60% 50%" },
          "75%": { borderRadius: "40% 60% 50% 50% / 60% 40% 50% 60%" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(79,70,229,0.1)" },
          "50%": { borderColor: "rgba(79,70,229,0.3)" },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(79, 70, 229, 0.1)',
        'glow-md': '0 0 30px rgba(79, 70, 229, 0.15)',
        'glow-lg': '0 0 60px rgba(79, 70, 229, 0.2)',
        'premium': '0 20px 60px -12px rgba(79, 70, 229, 0.2)',
      }
    },
  },
  plugins: [],
};
export default config;
