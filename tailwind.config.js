/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        navy:       "#0A1628",
        "navy-mid": "#0F2035",
        "navy-border": "#1E3A5F",
        ice:        "#F0F4F8",
        blue:       "#0EA5E9",
        muted:      "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
