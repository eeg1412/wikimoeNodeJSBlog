import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      extensions: [
        '.mjs',
        '.js',
        '.mts',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue'
      ]
    },
    base: isProduction ? '/admin/' : '/',
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version)
    },
    server: {
      port: 8079,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3006',
          changeOrigin: true
        },
        '/content/uploadfile': {
          target: 'http://127.0.0.1:3006',
          changeOrigin: true
        },
        '/upload': {
          target: 'http://127.0.0.1:3006',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: '../server/front/admin/',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {}
      }
    }
  }
})
