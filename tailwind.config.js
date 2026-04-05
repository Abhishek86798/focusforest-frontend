/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Figma design tokens (node 27:6)
        'forest-green':      '#006D37',
        'forest-lightgreen': 'rgba(187, 233, 194, 0.50)',
        'forest-blue':       '#3598DB',
        'forest-black':      '#1A1A1A',
        'forest-white':      '#F2F2F2',
        'forest-superwhite': '#FAFAFA',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neo':    '4px 4px 0px 0px #1A1A1A',
        'neo-sm': '2px 2px 0px 0px #1A1A1A',
      },
    },
  },
  plugins: [],
};
