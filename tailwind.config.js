const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    screens: {
      ...defaultTheme.screens,
      md: "900px",
    },
    extend: {
      colors: {
        "paris-daisy": {
          DEFAULT: "#FFEB66",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#FFFFFF",
          300: "#FFF8CC",
          400: "#FFF199",
          500: "#FFEB66",
          600: "#FFE433",
          700: "#FFDD00",
          800: "#CCB100",
          900: "#998500",
        },
        "bright-sun": {
          DEFAULT: "#FFCD42",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#FFF5DB",
          300: "#FFE8A8",
          400: "#FFDA75",
          500: "#FFCD42",
          600: "#FFBF0F",
          700: "#DBA100",
          800: "#A87B00",
          900: "#755600",
        },
        apple: {
          DEFAULT: "#48BB4A",
          50: "#EFF9EF",
          100: "#DDF2DD",
          200: "#B8E4B8",
          300: "#92D794",
          400: "#6DC96F",
          500: "#48BB4A",
          600: "#38983A",
          700: "#2B722C",
          800: "#1D4D1E",
          900: "#0F280F",
        },
        zoom: {
          DEFAULT: "#2681F2",
          50: "#FFFFFF",
          100: "#E6F1FE",
          200: "#B6D5FB",
          300: "#86B9F8",
          400: "#569DF5",
          500: "#2681F2",
          600: "#0D68D8",
          700: "#0A50A8",
          800: "#073978",
          900: "#042248",
        },
      },
    },
  },
  variants: {
    extend: {
      ringWidth: ["hover"],
      ringColor: ["hover"],
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};
