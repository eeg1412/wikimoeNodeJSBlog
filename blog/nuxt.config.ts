// https://nuxt.com/docs/api/configuration/nuxt-config

const modulesPlus = []
const publicRuntimeConfigPlus: any = {}
if (process.env.GOOGLE_ADSENSE_ID) {
  modulesPlus.push('@nuxtjs/google-adsense')
  publicRuntimeConfigPlus.googleAdsense = {
    onPageLoad: true,
    pageLevelAds: false,
    id: process.env.GOOGLE_ADSENSE_ID,
    test: process.env.GOOGLE_ADSENSE_TEST_MODE === '1',
  }
  // GOOGLE_ADSENSE_POST_DETAIL_BT
  publicRuntimeConfigPlus.GOOGLE_ADSENSE_POST_DETAIL_BT =
    process.env.GOOGLE_ADSENSE_POST_DETAIL_BT || null
}
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport:
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
    },
  },
  devtools: { enabled: true },
  devServer: {
    port: 8078,
  },
  modules: ['@pinia/nuxt', '@nuxt/ui', 'nuxt-swiper', ...modulesPlus],

  swiper: {
    // Swiper options
    //----------------------
    // prefix: 'Swiper',
    styleLang: 'css',
    // modules: ['navigation', 'pagination'], // all modules are imported by default
  },
  css: ['~/assets/css/common.css', 'photoswipe/style.css'],
  runtimeConfig: {
    apiDomain: '',
    public: {
      ...publicRuntimeConfigPlus,
    },
  },
  routeRules: {
    '/api/admin/**': {
      proxy: `${process.env.NUXT_API_API_DOMAIN}/api/admin/**`,
    },
    '/rss': {
      proxy: `${process.env.NUXT_API_API_DOMAIN}/rss`,
    },
    '/content/**': {
      proxy: `${process.env.NUXT_API_API_DOMAIN}/content/**`,
    },
    '/upload/**': {
      proxy: `${process.env.NUXT_API_API_DOMAIN}/upload/**`,
    },
    '/api/blog/**': {
      proxy: `${process.env.NUXT_API_API_DOMAIN}/api/blog/**`,
    },
  },
  colorMode: {
    preference: 'light',
  },
  nitro: {
    output: {
      dir: 'build/.output',
      serverDir: 'build/.output/server',
      publicDir: 'build/.output/public',
    },
  },
})
