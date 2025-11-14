import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: "#00B36B", // verde moderno
            background: "#F8F9FA", // gris claro suave
            foreground: "#111111",
            gray: "#1D1E24",
          },
        },
        dark: {
          colors: {
            primary: "#F66315", // verde neón sutil en dark
            background: "#101211", // gris oscuro cálido
            foreground: "#ffffff",
          },
        },
      },
    }),
  ],
};

module.exports = config;
