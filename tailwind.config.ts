import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1B2A4A", light: "#2C4370" },
        paper: "#EAEDE7",
        brass: { DEFAULT: "#A9822F", light: "#E4C767" },
        terracotta: "#B84C3C",
        sage: "#4F7A5C",
        ink: { DEFAULT: "#23262B", soft: "#6B7280" },
        line: "#D8DCD2",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
