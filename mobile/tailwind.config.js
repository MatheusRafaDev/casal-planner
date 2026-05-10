/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A78BFA', // Purple from Web
          dark: '#8B5CF6',
        },
        secondary: '#F9A8D4', // Pink from Web
        accent: '#FF6B6B',    // Accent from Web
        background: '#18181B', // Dark background
        surface: '#27272A',    // Card background
        border: '#3F3F46',
        text: {
          DEFAULT: '#F4F4F5',
          soft: '#D4D4D8',
          light: '#71717A',
        }
      }
    },
  },
  plugins: [],
}
