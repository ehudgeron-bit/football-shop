import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        brand: {
          primary: "#333333",
          hover: "#4F4F4F",
          secondary: "#507ABE",
          accent: "#E69900",
          red: "#cf2e2e",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#F4F4F4",
          tertiary: "#E5E5E5",
        },
        text: {
          primary: "#333333",
          secondary: "#6d6c6c",
          muted: "#767676",
        },
      },
      screens: {
        xs: "375px",
        sm: "600px",
        md: "960px",
        lg: "1440px",
        xl: "1920px",
      },
      borderRadius: {
        "4": "4px",
        "6": "6px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "24": "24px",
        pill: "9999px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      boxShadow: {
        natural: "6px 6px 9px rgba(0,0,0,0.2)",
        deep: "12px 12px 50px rgba(0,0,0,0.4)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
