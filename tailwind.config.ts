import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        reactor: {
          black: "#050505",
          panel: "#101010",
          grid: "#2A2A2A",
          blue: "#2563EB",
          cyan: "#00FFD1",
          green: "#36FF7A",
          red: "#FF3B30",
          yellow: "#FFD60A",
          white: "#F5F5F5",
          gray: "#A1A1AA",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

