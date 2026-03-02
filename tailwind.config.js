/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ivory: '#EDEDED',
        ink: '#0A0A0A',
        charcoal: '#1C1C1C',
        muted: '#6B6B6B',
        border: '#D4D4D4',
        surface: '#F5F5F5',
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_400Regular'],
        'playfair-medium': ['PlayfairDisplay_500Medium'],
        'playfair-bold': ['PlayfairDisplay_700Bold'],
        'playfair-italic': ['PlayfairDisplay_400Regular_Italic'],
        'playfair-bold-italic': ['PlayfairDisplay_700Bold_Italic'],
      },
    },
  },
  plugins: [],
};
