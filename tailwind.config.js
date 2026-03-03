/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0B101E', // Deep Navy for main app backgrounds
        surface: '#172036',    // Blue-Gray for cards, tab bars, and inputs
        accent: '#00E5FF',     // Neon Cyan for buttons and active states
        primaryText: '#F8F9FA', // Off-White for main headings and titles
      },
      fontFamily: {
        archivo: ['ArchivoBlack_400Regular'],
        barlow: ['Barlow_400Regular'],
        bebas: ['BebasNeue_400Regular'],
        caveat: ['CaveatBrush_400Regular'],
        concert: ['ConcertOne_400Regular'],
        greatvibes: ['GreatVibes_400Regular'],
        inter: ['Inter_400Regular'],
        lato: ['Lato_400Regular'],
        lobster: ['Lobster_400Regular'],
        orbitron: ['Orbitron_400Regular'],
        pacifico: ['Pacifico_400Regular'],
        parisienne: ['Parisienne_400Regular'],
        rubikmono: ['RubikMonoOne_400Regular'],
        sacramento: ['Sacramento_400Regular'],
      },
    
    },
  },
  plugins: [],
};