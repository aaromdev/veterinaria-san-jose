import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// En GitHub Pages el sitio se sirve desde un subdirectorio:
// https://aaromdev.github.io/veterinaria-san-jose/
// Por eso base debe apuntar a ese subdirectorio.
const repoName = 'veterinaria-san-jose'

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    css: false,
  },
})
