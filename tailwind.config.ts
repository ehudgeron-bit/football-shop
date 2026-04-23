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
        // Heebo is the standard Hebrew-first font — designed for RTL
        sans: ["var(--font-heebo)", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#111111",
          red: "#EE0005",
          orange: "#FF5000",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#F5F5F5",
          tertiary: "#E5E5E5",
        },
        text: {
          primary: "#111111",
          secondary: "#707072",
          muted: "#9E9EA0",
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
    },
  },
  plugins: [],
};

export default config;
