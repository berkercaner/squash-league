/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f8fafc",
          raised: "#ffffff",
          dark: "#0b1220",
          "dark-subtle": "#0f1729",
          "dark-raised": "#141d33",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 8px 24px -4px rgba(15, 23, 42, 0.12), 0 2px 8px -2px rgba(15, 23, 42, 0.08)",
        glow: "0 0 0 1px rgba(34, 211, 238, 0.15), 0 8px 24px -8px rgba(34, 211, 238, 0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "pop-in": "pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
