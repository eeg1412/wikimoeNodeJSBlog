// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    port: 8078,
  },
  modules: ['@pinia/nuxt', '@nuxt/ui', 'nuxt-swiper'],
  swiper: {
    // Swiper options
    //----------------------
    // prefix: 'Swiper',
    styleLang: 'css',
    // modules: ['navigation', 'pagination'], // all modules are imported by default
  },
  css: ['~/assets/css/common.css'],
  runtimeConfig: {
    apiDomain: '',
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
})
