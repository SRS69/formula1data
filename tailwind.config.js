module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'sfondo': '#faf1f2',
        'secondiario': '#295395',
        'nero': '#101011',
        'rosso': '#e10600',
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '1920px'
    },
  },
  plugins: [
    require("daisyui")
  ],

  daisyui: {
    themes: [
      {
        f1theme: {
          "primary": "#dc2626",
          "secondary": "#0369a1",
          "accent": "#fde047",
          "neutral": "#292524",
          "base-100": "#f3f4f6",
          "info": "#7dd3fc",
          "success": "#4ade80",
          "warning": "#fb923c",
          "error": "#991b1b",
        },
      },
    ],
    // styled: true,
    // themes: true,
    // base: true,
    // utils: true,
    // logs: true,
    // rtl: false,
    // prefix: "",
    // darkTheme: "light",
  },
}
