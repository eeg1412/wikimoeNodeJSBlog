import * as crypto from 'node:crypto'
import { default as LRUCacheDriver } from 'unstorage/drivers/lru-cache'

export default defineNitroPlugin(nitroApp => {
  // 每秒输出内存使用情况，输出MB
  // setInterval(() => {
  //   const memoryUsage = process.memoryUsage()
  //   const memoryUsageMB = {
  //     rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
  //     heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
  //     heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
  //     external: (memoryUsage.external / 1024 / 1024).toFixed(2)
  //   }
  //   console.log('Memory Usage (MB):', memoryUsageMB)
  // }, 1000)

  const config = useRuntimeConfig()

  /**
   * 配置验证工具函数集合
   */
  const validateConfig = {
    /**
     * 验证值是否为有效的非负整数
     * @param {string|number} value - 待验证的值
     * @param {string} fieldName - 字段名称，用于错误信息
     * @returns {object} { valid: boolean, value: number|null, error: string|null }
     */
    validatePositiveInteger(value, fieldName) {
      const num = Number(value)

      // 检查是否为有效数字
      if (isNaN(num)) {
        return {
          valid: false,
          value: null,
          error: `${fieldName} 必须是数字类型，当前值: ${value}`
        }
      }

      // 检查是否为整数
      if (!Number.isInteger(num)) {
        return {
          valid: false,
          value: null,
          error: `${fieldName} 必须是整数，当前值: ${num}`
        }
      }

      // 检查是否为非负数
      if (num < 0) {
        return {
          valid: false,
          value: null,
          error: `${fieldName} 必须是非负数，当前值: ${num}`
        }
      }

      return {
        valid: true,
        value: num,
        error: null
      }
    },

    /**
     * 验证布尔开关配置
     * @param {string|number} value - 待验证的值
     * @param {string} fieldName - 字段名称
     * @returns {object} { valid: boolean, value: boolean|null, error: string|null }
     */
    validateBoolean(value, fieldName) {
      const num = Number(value)

      // 检查是否为有效数字
      if (isNaN(num)) {
        return {
          valid: false,
          value: null,
          error: `${fieldName} 必须是数字类型，当前值: ${value}`
        }
      }

      // 只允许 0 或 1
      if (num !== 0 && num !== 1) {
        return {
          valid: false,
          value: null,
          error: `${fieldName} 只允许 0 或 1，当前值: ${num}`
        }
      }

      return {
        valid: true,
        value: num === 1,
        error: null
      }
    }
  }

  /**
   * 初始化并验证 SWR 配置
   */
  const initializeSWRConfig = () => {
    // 读取原始配置值
    const rawSwrEnabled = config.swrEnabled || '0'
    const rawSwrCacheMaxage = config.swrCacheMaxage || '10'
    const rawSwrCacheStaleMaxage = config.swrCacheStaleMaxage || '3600'
    const rawSwrCacheMaxPage = config.swrCacheMaxPage || '100'
    const rawSwrCacheTtl = config.swrCacheTtl || '86400'

    // 存储验证结果
    const validationResults = {
      swrEnabled: validateConfig.validateBoolean(rawSwrEnabled, 'swrEnabled'),
      swrCacheMaxage: validateConfig.validatePositiveInteger(
        rawSwrCacheMaxage,
        'swrCacheMaxage'
      ),
      swrCacheStaleMaxage: validateConfig.validatePositiveInteger(
        rawSwrCacheStaleMaxage,
        'swrCacheStaleMaxage'
      ),
      swrCacheMaxPage: validateConfig.validatePositiveInteger(
        rawSwrCacheMaxPage,
        'swrCacheMaxPage'
      ),
      swrCacheTtl: validateConfig.validatePositiveInteger(
        rawSwrCacheTtl,
        'swrCacheTtl'
      )
    }

    // 检查是否有验证错误
    const validationErrors = Object.entries(validationResults)
      .filter(([_, result]) => !result.valid)
      .map(([name, result]) => result.error)

    // 如果有验证错误，输出警告并禁用 SWR
    if (validationErrors.length > 0) {
      console.warn(
        '\n❌ SWR 配置验证失败:\n',
        validationErrors.map(err => `  - ${err}`).join('\n'),
        '\n⚠️  已强制禁用 SWR 功能以保障系统稳定性\n'
      )
      return {
        SWR_ENABLED: false,
        SWR_CACHE_MAXAGE: 10 * 1000,
        SWR_CACHE_STALEMAXAGE: 3600 * 1000,
        SWR_CACHE_MAX_PAGE: 100,
        SWR_CACHE_TTL: 86400 * 1000
      }
    }

    // 所有验证通过，返回转换后的配置值
    const finalConfig = {
      SWR_ENABLED: validationResults.swrEnabled.value,
      SWR_CACHE_MAXAGE: validationResults.swrCacheMaxage.value * 1000,
      SWR_CACHE_STALEMAXAGE: validationResults.swrCacheStaleMaxage.value * 1000,
      SWR_CACHE_MAX_PAGE: validationResults.swrCacheMaxPage.value,
      SWR_CACHE_TTL: validationResults.swrCacheTtl.value * 1000
    }

    const status = finalConfig.SWR_ENABLED ? '✅ 已启用' : '⚠️  已禁用'
    console.log(`\n${status} SWR 功能\n`)
    console.log('📋 SWR 配置详情:')
    console.log(`  - SWR_ENABLED: ${finalConfig.SWR_ENABLED}`)
    console.log(
      `  - SWR_CACHE_MAXAGE: ${finalConfig.SWR_CACHE_MAXAGE / 1000}s (${
        finalConfig.SWR_CACHE_MAXAGE
      }ms)`
    )
    console.log(
      `  - SWR_CACHE_STALEMAXAGE: ${
        finalConfig.SWR_CACHE_STALEMAXAGE / 1000
      }s (${finalConfig.SWR_CACHE_STALEMAXAGE}ms)`
    )
    console.log(`  - SWR_CACHE_MAX_PAGE: ${finalConfig.SWR_CACHE_MAX_PAGE}`)
    console.log(
      `  - SWR_CACHE_TTL: ${finalConfig.SWR_CACHE_TTL / 1000}s (${
        finalConfig.SWR_CACHE_TTL
      }ms)\n`
    )

    return finalConfig
  }

  // 初始化 SWR 配置
  const swrConfig = initializeSWRConfig()
  const SWR_ENABLED = swrConfig.SWR_ENABLED
  const SWR_CACHE_TTL = swrConfig.SWR_CACHE_TTL
  const SWR_CACHE_MAX_PAGE = swrConfig.SWR_CACHE_MAX_PAGE
  const SWR_CACHE_MAXAGE = swrConfig.SWR_CACHE_MAXAGE
  const SWR_CACHE_STALEMAXAGE = swrConfig.SWR_CACHE_STALEMAXAGE
  const MAX_URL_LENGTH = 2083
  const CACHE_KEY_PREFIX = 'routecache:'
  const CACHEABLE_METHODS = new Set(['GET'])
  const BLOCKED_CACHE_HEADERS = new Set([
    'set-cookie',
    'cookie',
    'authorization',
    'proxy-authorization',
    'www-authenticate',
    'proxy-authenticate',
    'connection',
    'transfer-encoding',
    'keep-alive',
    'te',
    'trailers',
    'upgrade',
    'content-length'
  ])
  const inflightCacheWrites = new Set()
  const inflightBackgroundUpdates = new Set()

  // 缓存URL列表
  const cachedUrls = new Set([
    // 首页
    '/',
    // 文章列/文章详情
    '/post/*',
    // 页面
    '/page/*'
  ])

  // 生成32位随机密码
  const RANDOMPASS = crypto.randomBytes(32).toString('hex')

  // 预编译缓存URL正则，避免每次请求重复创建正则对象，并修复正则转义安全隐患
  const cachedUrlRegexes = Array.from(cachedUrls).map(pattern => {
    // 转义正则特殊字符，除了 *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    // 将 * 替换为 .*
    const regexStr = '^' + escaped.replace(/\*/g, '.*') + '$'
    return new RegExp(regexStr)
  })

  // 检查url是否在缓存列表中
  function isUrlCacheable(url) {
    // url 拆分路径和查询参数
    const [path] = url.split('?')

    for (const regex of cachedUrlRegexes) {
      if (regex.test(path)) {
        return true
      }
    }
    return false
  }

  function isUrlTooLong(url) {
    return url.length > MAX_URL_LENGTH
  }

  function isMethodCacheable(method = 'GET') {
    return CACHEABLE_METHODS.has((method || 'GET').toUpperCase())
  }

  function isBodyCacheable(body) {
    return typeof body === 'string'
  }

  function getCacheKey(url) {
    const safeUrl = url || '/'
    return `${CACHE_KEY_PREFIX}${crypto
      .createHash('sha256')
      .update(safeUrl)
      .digest('base64url')}`
  }

  function sanitizeHeaders(headers = {}) {
    const normalized =
      typeof Headers !== 'undefined' && headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : { ...headers }

    for (const key of Object.keys(normalized)) {
      if (BLOCKED_CACHE_HEADERS.has(key.toLowerCase())) {
        delete normalized[key]
      }
    }
    return normalized
  }

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = LRUCacheDriver({
    max: SWR_CACHE_MAX_PAGE,
    ttl: SWR_CACHE_TTL,
    updateAgeOnGet: true,
    updateAgeOnHas: true
    /* other redis connector options */
  })

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // console.log('Nitro config hook', html, event)
  })

  // render:response
  nitroApp.hooks.hook('render:response', async (response, { event }) => {
    const url = event.node.req.url || ''
    const method = event.node.req.method || 'GET'
    const cacheState = event.node.res.getHeader('x-wm-cache')

    // 仅当 request 阶段标记为 MISS 或 UPDATING 时才写入/更新缓存
    if (!['MISS', 'UPDATING'].includes(cacheState)) {
      return
    }

    if (response.statusCode !== 200 || !isMethodCacheable(method)) {
      return
    }

    if (!isBodyCacheable(response.body)) {
      console.warn(`Skip caching for ${url}: unsupported response body type`)
      return
    }

    const cacheKey = getCacheKey(url)

    if (inflightCacheWrites.has(cacheKey)) {
      return
    }

    inflightCacheWrites.add(cacheKey)
    try {
      driver.setItem(cacheKey, {
        headers: sanitizeHeaders(response.headers),
        response: {
          body: response.body
        },
        timestamp: Date.now(),
        originalUrl: url
      })
      console.log(`Cached response for ${url} with key ${cacheKey}`)
    } catch (error) {
      console.error(`Failed to cache response for ${url}:`, error)
    } finally {
      inflightCacheWrites.delete(cacheKey)
    }
  })

  // request
  nitroApp.hooks.hook('request', async event => {
    const req = event.node.req
    const url = req.url || ''
    const method = req.method || 'GET'

    // 检查URL长度，超过则返回400
    if (isUrlTooLong(url)) {
      console.warn(
        `Request URL exceeds ${MAX_URL_LENGTH} characters: ${url.length} bytes`
      )
      event.node.res.statusCode = 400
      event.node.res.end('Bad Request: URL too long')
      return
    }

    let XWMCACHE_VALUE = 'BYPASS'

    if (!isMethodCacheable(method)) {
      event.node.res.setHeader('x-wm-cache', XWMCACHE_VALUE)
      return
    }

    const shouldCache = SWR_ENABLED && isUrlCacheable(url)
    if (shouldCache) {
      XWMCACHE_VALUE = 'MISS'
      // 添加SWR的头
      event.node.res.setHeader(
        'Cache-Control',
        `s-maxage=${SWR_CACHE_MAXAGE / 1000}, stale-while-revalidate=${
          SWR_CACHE_STALEMAXAGE / 1000
        }`
      )

      const cacheKey = getCacheKey(url)

      // 读取LRU缓存
      const cached = driver.getItem(cacheKey)
      if (cached) {
        // 检查是否超过 SWR_CACHE_MAXAGE
        const age = Date.now() - cached.timestamp
        if (age > SWR_CACHE_MAXAGE) {
          const reqCacheHeader = req.headers['x-wm-cache'] || ''
          if (reqCacheHeader === 'UPDATING') {
            // 检查 x-wm-cache-update-pass 是否正确
            const reqPass = req.headers['x-wm-cache-update-pass'] || ''
            if (reqPass !== RANDOMPASS) {
              event.node.res.statusCode = 403
              event.node.res.end('Forbidden: Invalid cache update pass')
              return
            }

            event.node.res.setHeader('x-wm-cache', XWMCACHE_VALUE)
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
          if (!inflightBackgroundUpdates.has(cacheKey)) {
            inflightBackgroundUpdates.add(cacheKey)
            $fetch(event.node.req.url, {
              method: method,
              headers: {
                'x-wm-cache': XWMCACHE_VALUE,
                'x-wm-cache-update-pass': RANDOMPASS
              }
            })
              .then(res => {
                console.log(`Background cache update completed for ${url}`)
              })
              .catch(err => {
                console.error(`Background cache update failed for ${url}:`, err)
              })
              .finally(() => {
                inflightBackgroundUpdates.delete(cacheKey)
              })
          }
        }

        // 使用 respondWith 返回缓存内容
        return event.respondWith(
          new Response(cached.response.body, {
            status: 200,
            headers: new Headers(cached.headers || {})
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
