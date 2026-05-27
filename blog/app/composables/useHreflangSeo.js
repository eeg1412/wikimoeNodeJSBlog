/**
 * @description 介绍：规范化用于 SEO 链接的站点地址；输入：站点地址配置。
 * @param {string} siteUrl 输入：站点地址。
 * @returns {string} 输出：去掉末尾斜杠后的 http(s) 站点地址。
 */
function normalizeHreflangSiteUrl(siteUrl) {
  if (typeof siteUrl !== 'string') {
    return ''
  }

  const normalizedSiteUrl = siteUrl.trim().replace(/\/+$/, '')
  if (!normalizedSiteUrl) {
    return ''
  }

  let parsedUrl = null
  try {
    parsedUrl = new URL(normalizedSiteUrl)
  } catch {
    return ''
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return ''
  }

  return normalizedSiteUrl
}

/**
 * @description 介绍：规范化站内路径；输入：站内路径。
 * @param {string} path 输入：站内路径。
 * @returns {string} 输出：以 / 开头的路径。
 */
function normalizeHreflangPath(path) {
  if (typeof path !== 'string') {
    return ''
  }

  const normalizedPath = path.trim()
  if (!normalizedPath) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(normalizedPath)) {
    return ''
  }

  if (normalizedPath.startsWith('#')) {
    return ''
  }

  if (!normalizedPath.startsWith('/')) {
    return `/${normalizedPath}`
  }

  return normalizedPath
}

/**
 * @description 介绍：规范化 hreflang 值；输入：语言码或 x-default。
 * @param {string} hreflang 输入：hreflang 值。
 * @returns {string} 输出：可写入 link 标签的 hreflang。
 */
function normalizeHreflangValue(hreflang) {
  if (typeof hreflang !== 'string') {
    return ''
  }

  const normalizedHreflang = hreflang.trim()
  if (!normalizedHreflang) {
    return ''
  }

  if (normalizedHreflang.toLowerCase() === 'x-default') {
    return 'x-default'
  }

  return normalizedHreflang
}

/**
 * @description 介绍：拼接 hreflang 绝对链接；输入：已规范化站点地址和站内路径。
 * @param {string} siteUrl 输入：已规范化站点地址。
 * @param {string} path 输入：站内路径。
 * @returns {string} 输出：绝对链接。
 */
function createHreflangHref(siteUrl, path) {
  const normalizedPath = normalizeHreflangPath(path)
  if (!normalizedPath) {
    return ''
  }

  return `${siteUrl}${normalizedPath}`
}

/**
 * @description 介绍：提供 hreflang head link 构建和写入能力；输入：无。
 * @returns {object} 输出：包含 createHreflangLinks 和 setHreflangLinks。
 */
export function useHreflangSeo() {
  /**
   * @description 介绍：把页面语言项转换成 Nuxt head link 数组；输入：站点地址、语言项和 x-default 路径。
   * @param {object} params 输入：hreflang 配置。
   * @param {string} params.siteUrl 输入：站点地址。
   * @param {Array<{hreflang?: string, languageCode?: string, path: string}>} params.entries 输入：语言项。
   * @param {string} [params.xDefaultPath] 输入：x-default 指向路径。
   * @returns {Array<object>} 输出：Nuxt head link 数组。
   */
  function createHreflangLinks(params = {}) {
    const siteUrl = normalizeHreflangSiteUrl(params.siteUrl)
    if (!siteUrl) {
      return []
    }

    const entries = params.entries
    if (!Array.isArray(entries) || entries.length === 0) {
      return []
    }

    const usedHreflangSet = new Set()
    const linkList = []

    entries.forEach(entry => {
      if (!entry || typeof entry !== 'object') {
        return
      }

      let hreflang = normalizeHreflangValue(entry.hreflang)
      if (!hreflang) {
        hreflang = normalizeHreflangValue(entry.languageCode)
      }
      if (!hreflang) {
        return
      }

      if (usedHreflangSet.has(hreflang)) {
        return
      }

      const href = createHreflangHref(siteUrl, entry.path)
      if (!href) {
        return
      }

      usedHreflangSet.add(hreflang)
      linkList.push({
        key: `alternate-hreflang-${hreflang}`,
        rel: 'alternate',
        hreflang,
        href
      })
    })

    if (linkList.length === 0) {
      return []
    }

    const xDefaultHref = createHreflangHref(siteUrl, params.xDefaultPath)
    if (xDefaultHref) {
      linkList.push({
        key: 'alternate-hreflang-x-default',
        rel: 'alternate',
        hreflang: 'x-default',
        href: xDefaultHref
      })
    }

    return linkList
  }

  /**
   * @description 介绍：把响应式 hreflang link 写入 head；输入：link 数组或响应式 link 数组。
   * @param {any} links 输入：link 数组、computed 或 ref。
   * @returns {void} 输出：无返回值。
   */
  function setHreflangLinks(links) {
    useHead(() => {
      const resolvedLinks = unref(links)
      if (!Array.isArray(resolvedLinks) || resolvedLinks.length === 0) {
        return {
          link: []
        }
      }

      return {
        link: resolvedLinks
      }
    })
  }

  return {
    createHreflangLinks,
    setHreflangLinks
  }
}
