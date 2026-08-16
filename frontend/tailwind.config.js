/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#090d16",
        cardBg: "rgba(18, 24, 38, 0.7)",
      },
    },
  },
  plugins: [],
}
