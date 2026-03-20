import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          50:  '#fdf9ef',
          100: '#faf0d4',
          200: '#f4dfa0',
          300: '#ecc96a',
          400: '#e3b240',
          500: '#C9A84C',
          600: '#b08a32',
          700: '#8a6a24',
          800: '#664f1b',
          900: '#453412',
        },
        primary: {
          50:  '#fdf9ef',
          100: '#faf0d4',
          200: '#f4dfa0',
          300: '#ecc96a',
          400: '#e3b240',
          500: '#C9A84C',
          600: '#b08a32',
          700: '#8a6a24',
          800: '#664f1b',
          900: '#453412',
        },
      },
    },
  },
  plugins: [],
};

export default config;
