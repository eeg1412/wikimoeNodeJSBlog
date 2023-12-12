// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    port: 8078,
  },
  runtimeConfig: {
    apiDomain: '',
    public: {
      apiBase: '/api/blog',
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
  },
})
