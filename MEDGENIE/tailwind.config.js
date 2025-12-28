/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "mg": "0 4px 30px rgba(124, 58, 237, 0.25)",
        "mg-soft": "0 4px 20px rgba(37, 99, 235, 0.18)",
      },
      backgroundImage: {
        "mg-primary": "linear-gradient(135deg, #7c3aed, #2563eb)",
        "mg-secondary": "linear-gradient(135deg, #a855f7, #3b82f6)",
      },
    },
  },
  plugins: [],
};
