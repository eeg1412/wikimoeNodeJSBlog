import { resolve } from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  base: '/panorama/',
  publicDir: false,
  build: {
    outDir: resolve(__dirname, '../blog/public/panorama'),
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'es2020'
  }
})
