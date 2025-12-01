// https://nuxt.com/docs/api/configuration/nuxt-config
const command = process.argv[2]
console.log('当前执行的命令:', command)
const publicRuntimeConfigPlus = {}

// 判断是否是 build 命令
const isBuild = command === 'build'

// 缓存时间
const cacheTime = isBuild
  ? '__NUXT_ENV_SWR_CACHE_MAXAGE__'
  : process.env.SWR_CACHE_MAXAGE
  ? Number(process.env.SWR_CACHE_MAXAGE)
  : 10
const staleMaxAge = isBuild
  ? '__NUXT_ENV_SWR_CACHE_STALEMAXAGE__'
  : process.env.SWR_CACHE_STALEMAXAGE
  ? Number(process.env.SWR_CACHE_STALEMAXAGE)
  : 3600

// API 域名
const apiDomain = isBuild
  ? '__NUXT_ENV_API_DOMAIN__'
  : process.env.NUXT_API_DOMAIN

let routeRules = {
  '/rss': {
    proxy: `${apiDomain}/rss`
  },
  '/rss/blog': {
    proxy: `${apiDomain}/rss/blog`
  },
  '/rss/tweet': {
    proxy: `${apiDomain}/rss/tweet`
  },
  '/content/**': {
    proxy: `${apiDomain}/content/**`
  },
  '/upload/**': {
    proxy: `${apiDomain}/upload/**`
  },
  '/up_works/**': {
    proxy: `${apiDomain}/up_works/**`
  },
  '/web_demo/**': {
    proxy: `${apiDomain}/web_demo/**`
  },
  // ucloudImg
  '/ucloudImg/**': {
    proxy: `${apiDomain}/ucloudImg/**`
  },
  '/api/blog/**': {
    proxy: `${apiDomain}/api/blog/**`
  },
  // sitemap.xml
  '/sitemap.xml': {
    proxy: `${apiDomain}/sitemap.xml`
  },
  // sitemap.xsl
  '/sitemap.xsl': {
    proxy: `${apiDomain}/sitemap.xsl`
  },
  // ads.txt
  '/ads.txt': {
    proxy: `${apiDomain}/ads.txt`
  },
  // robots.txt
  '/robots.txt': {
    proxy: `${apiDomain}/seo/blog/robots.txt`
  },
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
// 如果开启了SWR
if (process.env.SWR_ENABLED === '1') {
  const swrRules = {
    '/': {
      swr: cacheTime,
      cache: {
        staleMaxAge: staleMaxAge
      }
    },
    '/page/**': {
      swr: cacheTime,
      cache: {
        staleMaxAge: staleMaxAge
      }
    },
    '/post/**': {
      swr: cacheTime,
      cache: {
        staleMaxAge: staleMaxAge
      }
    }
  }
  routeRules = { ...routeRules, ...swrRules }
}
// 构建时缓存配置使用占位符，开发时使用实际数值
const CACHE_MAX_PAGE_BUILD = isBuild
  ? '__NUXT_ENV_CACHE_MAX_PAGE__'
  : process.env.CACHE_MAX_PAGE
  ? Number(process.env.CACHE_MAX_PAGE)
  : 10
const CACHE_TTL_BUILD = isBuild
  ? '__NUXT_ENV_CACHE_TTL__'
  : process.env.CACHE_TTL
  ? Number(process.env.CACHE_TTL)
  : 60000

// 开发时缓存配置始终使用实际数值
const CACHE_MAX_PAGE_DEV = process.env.CACHE_MAX_PAGE
  ? Number(process.env.CACHE_MAX_PAGE)
  : 10
const CACHE_TTL_DEV = process.env.CACHE_TTL
  ? Number(process.env.CACHE_TTL)
  : 60000

console.log('缓存最大页面数量', isBuild ? '(构建占位符)' : CACHE_MAX_PAGE_DEV)
console.log('缓存时间', isBuild ? '(构建占位符)' : CACHE_TTL_DEV)
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
        max: CACHE_MAX_PAGE_BUILD,
        ttl: CACHE_TTL_BUILD,
        updateAgeOnGet: true,
        updateAgeOnHas: true
      }
    },
    devStorage: {
      cache: {
        driver: 'lruCache',
        max: CACHE_MAX_PAGE_DEV,
        ttl: CACHE_TTL_DEV,
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
