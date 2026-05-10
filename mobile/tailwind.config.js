/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1c1c1e', // Apple like dark
          light: '#2c2c2e',
        },
        accent: {
          DEFAULT: '#0A84FF', // iOS blue
          nubank: '#8A05BE',
        },
        background: {
          DEFAULT: '#F2F2F7', // iOS grouped background light
          dark: '#000000',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1C1C1E',
        }
      },
      fontFamily: {
        sans: ['System', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}
