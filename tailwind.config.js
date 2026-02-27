/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mw: {
          bg: "rgb(var(--mw-bg) / <alpha-value>)",
          surface: "rgb(var(--mw-surface) / <alpha-value>)",
          soft: "rgb(var(--mw-soft) / <alpha-value>)",
          primary: "rgb(var(--mw-primary) / <alpha-value>)",
          light: "rgb(var(--mw-light) / <alpha-value>)",
          accent: "rgb(var(--mw-accent) / <alpha-value>)",
          border: "rgb(var(--mw-border) / <alpha-value>)",
          body: "rgb(var(--mw-body) / <alpha-value>)",
          dark: "rgb(var(--mw-dark) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
