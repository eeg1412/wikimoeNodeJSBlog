import LRUCacheDriver from 'unstorage/drivers/lru-cache'

export default defineNitroPlugin(nitroApp => {
  // const storage = useStorage()
  const TTL = 10 * 1000
  const MAX_ITEMS = 100

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = LRUCacheDriver({
    max: MAX_ITEMS,
    ttl: TTL,
    updateAgeOnGet: true,
    updateAgeOnHas: true
    /* other redis connector options */
  })

  // console.log('Nitro plugin', nitroApp)
  // const config = useRuntimeConfig()
  // console.log('Runtime config in nitro plugin', config)
  // const routerules = config.nitro.routeRules
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    console.log('Nitro config hook', html, event)
  })

  // render:response
  nitroApp.hooks.hook('render:response', async (response, { event }) => {
    console.log('Nitro response hook', response, event)
    // 如果状态是200，则缓存响应
    if (response.statusCode === 200) {
      // 写入LRU缓存
      await driver.setItem(event.node.req.url, {
        headers: response.headers,
        response: {
          body: response.body
        }
      })
    }
  })

  // request
  nitroApp.hooks.hook('request', async event => {
    const req = event.node.req
    const url = req.url
    // 读取LRU缓存
    const cached = await driver.getItem(url)
    if (cached) {
      // 设置缓存命中标记
      event.node.res.setHeader('x-cache-hit', '1')

      // 使用 respondWith 返回缓存内容
      return event.respondWith(
        new Response(cached.response.body, {
          status: 200,
          headers: new Headers(cached.headers)
        })
      )
    }
  })

  // beforeResponse
  nitroApp.hooks.hook('render:beforeResponse', (event, { body }) => {
    console.log('Nitro beforeResponse hook', event, body)
  })

  // afterResponse
  nitroApp.hooks.hook('render:afterResponse', (event, { body }) => {
    console.log('Nitro afterResponse hook', event, body)
  })

  // console.log('Nitro plugin end')
  // console.log('Nitro app config before update', nitroApp)
  // const appConfig = useAppConfig()
  // console.log('App config in nitro plugin', appConfig)
  // console.log(this)
  // setTimeout(() => {
  //   const nitro = useNitro()
  //   console.log('Nitro app config before update', nitro)
  // }, 1000)
  // console.log(nitroApp.updateConfig)
  // const nuxt = useNuxtApp()
  // nuxt.hook('ready', () => {
  //   const nitro = useNitro()
  //   console.log('Nitro app config on nuxt ready', nitro)
  //   // Do something with Nitro instance
  // })
})
