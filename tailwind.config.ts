import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mw: {
          primary: "#0b4f5a",
          light: "#2a6a73",
          accent: "#38c6b3",
          border: "#d7eeee",
          body: "#4a6569",
          dark: "#0b2a2f"
        }
      }
    }
  },
  plugins: []
};

export default config;
