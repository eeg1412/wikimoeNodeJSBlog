// https://nuxt.com/docs/api/configuration/nuxt-config
const publicRuntimeConfigPlus = {}

// 静态资源缓存规则（不包含反代规则，反代通过server routes实现运行时配置）
const routeRules = {
  '/geojson/world-mid.json': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/geojson/world-low.json': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  // 整个 avatar 目录
  '/img/avatar/**': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  // 整个 icon 目录
  '/img/icon/**': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  // 单个文件
  '/img/bg_02_dark.png': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/img/bg_02.png': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/img/menuBg.png': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/img/mypage-banner.webp': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/img/nodata.webp': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  '/img/nopic400-565.png': {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  }
}

console.log('routeRules', routeRules)
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport:
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
    }
    // 因为nuxt的页面动画有BUG导致两次运行onmounted，所以关闭
    // pageTransition: { name: 'page', mode: 'out-in' },
  },

  devtools: { enabled: true },

  devServer: {
    // host: '0.0.0.0',
    port: 8078
  },

  modules: ['@nuxt/ui', 'nuxt-swiper'],

  swiper: {
    // Swiper options
    //----------------------
    // prefix: 'Swiper',
    styleLang: 'css'
    // modules: ['navigation', 'pagination'], // all modules are imported by default
  },

  css: ['~/assets/css/common.css', 'photoswipe/style.css'],

  runtimeConfig: {
    // apiDomain: '',
    public: {
      version: process.env.npm_package_version,
      ...publicRuntimeConfigPlus
    }
  },

  routeRules,

  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script'
  },

  nitro: {
    output: {
      dir: 'build/.output',
      serverDir: 'build/.output/server',
      publicDir: 'build/.output/public'
    },
    storage: {
      cache: {
        driver: 'lruCache',
        max: 10,
        ttl: 60000,
        updateAgeOnGet: true,
        updateAgeOnHas: true
      }
    },
    devStorage: {
      cache: {
        driver: 'lruCache',
        max: 10,
        ttl: 60000,
        updateAgeOnGet: true,
        updateAgeOnHas: true
      }
    }
  },
  vite: {
    esbuild: {
      drop: ['debugger'],
      pure: [
        'console.log',
        'console.error',
        'console.warn',
        'console.debug',
        'console.trace'
      ]
    }
  },

  compatibilityDate: '2024-12-09'
})
