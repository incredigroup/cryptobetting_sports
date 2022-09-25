module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      outline: {
        blue: ['2px solid #ffffff', '2px'],
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
