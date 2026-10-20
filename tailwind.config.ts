import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: {
          DEFAULT: "var(--canvas-bg)",
          subtle: "var(--canvas-subtle)",
          muted: "var(--canvas-muted)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
          border: "var(--surface-border)",
          glow: "var(--surface-glow)",
        },
        amber: {
          50: "#fff8f0",
          100: "#ffeed6",
          200: "#ffd9a8",
          300: "#ffbe6f",
          400: "#ff9c3a",
          500: "#ff8c32",
          600: "#ff5a1a",
          700: "#e03e0b",
          800: "#b52c08",
          900: "#8f2409",
          950: "#4e1003",
        },
        success: {
          DEFAULT: "#50c878",
          subtle: "rgba(80, 200, 120, 0.15)",
          border: "rgba(80, 200, 120, 0.3)",
        },
        danger: {
          DEFAULT: "#f87171",
          subtle: "rgba(248, 113, 113, 0.15)",
          border: "rgba(248, 113, 113, 0.3)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        syne: ["var(--font-syne)", "Syne", "sans-serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "-apple-system", "sans-serif"],
        mono: ["var(--font-dm-mono)", "DM Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(255, 140, 50, 0.25)",
        "glow-lg": "0 0 40px -10px rgba(255, 140, 50, 0.35)",
        "glow-success": "0 0 25px -5px rgba(80, 200, 120, 0.25)",
        "glow-danger": "0 0 25px -5px rgba(248, 113, 113, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flowing-dots": "flow 1.5s linear infinite",
      },
      keyframes: {
        flow: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
