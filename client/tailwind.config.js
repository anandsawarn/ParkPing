/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
        sans: ["Trebuchet MS", "Segoe UI", "Verdana", "sans-serif"]
      },
      colors: {
        ink: "#1a1a1a",
        stone: "#f2efe8",
        surf: "#f7f3ea",
        tide: "#f4c97a",
        moss: "#2b7a78",
        clay: "#c65f3b",
        primaryBlue: "#0066cc",
        accentOrange: "#ff6b35",
        darkBg: "#0f1419",
        darkCard: "#1a1f2e"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,0,0,0.04), 0 12px 30px rgba(0,0,0,0.12)"
      }
    }
  },
  plugins: []
};
