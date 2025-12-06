import LRUCacheDriver from 'unstorage/drivers/lru-cache'

export default defineNitroPlugin(nitroApp => {
  // const storage = useStorage()
  const TTL = 3600 * 1000
  const MAX_ITEMS = 100
  const SWR_CACHE_MAXAGE = 10 * 1000

  // 缓存URL列表
  const cachedUrls = new Set([
    // 首页
    '/',
    // 文章列/文章详情
    '/post/*',
    // 页面
    '/page/*'
  ])

  // 检查url是否在缓存列表中
  function isUrlCacheable(url) {
    // url 拆分路径和查询参数
    const [path] = url.split('?')

    for (const pattern of cachedUrls) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$')
      if (regex.test(path)) {
        return true
      }
    }
    return false
  }

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = LRUCacheDriver({
    max: MAX_ITEMS,
    ttl: TTL,
    updateAgeOnGet: true,
    updateAgeOnHas: true
    /* other redis connector options */
  })

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // console.log('Nitro config hook', html, event)
  })

  // render:response
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    // console.log('Nitro response hook', response, event)
    // 如果状态是200，则缓存响应
    if (response.statusCode === 200) {
      // 写入LRU缓存
      driver.setItem(event.node.req.url, {
        headers: response.headers,
        response: {
          body: response.body
        },
        timestamp: Date.now()
      })
      console.log(`Cached response for ${event.node.req.url}`)
    }
  })

  // request
  nitroApp.hooks.hook('request', async event => {
    const req = event.node.req
    const url = req.url

    let XWMCACHE_VALUE = 'BYPASS'

    const shouldCache = isUrlCacheable(url)

    if (shouldCache) {
      XWMCACHE_VALUE = 'MISS'
    }

    if (shouldCache) {
      // 添加SWR的头
      event.node.res.setHeader(
        'Cache-Control',
        `s-maxage=${SWR_CACHE_MAXAGE / 1000}, stale-while-revalidate=${
          TTL / 1000
        }`
      )

      // 读取LRU缓存
      const cached = await driver.getItem(url)
      if (cached) {
        // 检查是否超过 SWR_CACHE_MAXAGE
        const age = Date.now() - cached.timestamp
        if (age > SWR_CACHE_MAXAGE) {
          const reqCacheHeader = req.headers['x-wm-cache'] || ''
          if (reqCacheHeader === 'UPDATING') {
            return
          }
          // 超过最大缓存时间，
          console.log(`Cache stale for ${url}, age: ${age}ms`)
          XWMCACHE_VALUE = 'UPDATING'
        } else {
          XWMCACHE_VALUE = 'HIT'
        }

        // 设置缓存命中标记
        event.node.res.setHeader('x-wm-cache', XWMCACHE_VALUE)

        console.log(`Serving cached response for ${url}`)

        // 如果 XWMCACHE_VALUE 是 UPDATING 则启动后台更新缓存
        if (XWMCACHE_VALUE === 'UPDATING') {
          // 后台更新缓存

          const method = req.method
          $fetch(event.node.req.url, {
            method: method,
            headers: {
              'x-wm-cache': XWMCACHE_VALUE
            }
          })
            .then(res => {
              console.log(`Background cache update completed for ${url}`)
            })
            .catch(err => {
              console.error(`Background cache update failed for ${url}:`, err)
            })
        }

        // 使用 respondWith 返回缓存内容
        return event.respondWith(
          new Response(cached.response.body, {
            status: 200,
            headers: new Headers(cached.headers)
          })
        )
      }
    }

    event.node.res.setHeader('x-wm-cache', XWMCACHE_VALUE)
  })

  // beforeResponse
  nitroApp.hooks.hook('render:beforeResponse', (event, { body }) => {
    console.log('Nitro beforeResponse hook', event, body)
  })

  // afterResponse
  nitroApp.hooks.hook('render:afterResponse', (event, { body }) => {
    console.log('Nitro afterResponse hook', event, body)
  })
})
