/** @type {import('tailwindcss').Config} */
// Sistema visual "Mostrador": paleta cerrada. Ver docs/diseno/README.md.
// No agregar colores fuera de esta lista (nada de slate/emerald de Tailwind).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tinta: '#1A1916',
        grafito: '#3A3833',
        piedra: '#6B675F',
        linea: '#E4E1DA',
        borde: '#D9D4C9',
        papel: '#F6F5F1',
        hueso: '#FBFAF7',
        crema: '#F3F1EC',
        maiz: { DEFAULT: '#E3A13B', claro: '#FBF0DC', texto: '#7A4E0E', borde: '#E8D3AE' },
        hoja: { DEFAULT: '#2E7D4F', claro: '#E7F1EA', texto: '#1F5E3A' },
        chile: { DEFAULT: '#B9382A', claro: '#F9E7E4', texto: '#9A2E22' },
        cielo: { claro: '#EAF0F8', texto: '#284A73' },
        riel: {
          DEFAULT: '#1A1916',
          panel: '#201F1B',
          hover: '#26251F',
          activo: '#2A2925',
          borde: '#2E2D28',
          avatar: '#33312C',
          texto: '#CFCAC0',
          tenue: '#8F8A80',
        },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        brillo: { '0%': { backgroundPosition: '100% 0' }, '100%': { backgroundPosition: '-100% 0' } },
      },
      animation: { brillo: 'brillo 1.3s ease-in-out infinite' },
    },
  },
  plugins: [],
}
