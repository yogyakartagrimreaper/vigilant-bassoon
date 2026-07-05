import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#4A2545", light: "#6E3F6A" },
        paper: "#F3EEE3",
        brass: { DEFAULT: "#C9A227", light: "#E8C766" },
        terracotta: "#8B2E2E",
        sage: "#707A45",
        ink: { DEFAULT: "#2B2622", soft: "#7A7266" },
        line: "#DDD5C4",
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
