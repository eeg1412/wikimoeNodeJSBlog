/**
 * SEO 数据处理公共函数
 * 为文章生成标题、描述、关键词、图片等SEO数据
 * 供useSeoMeta和JSON-LD共享使用
 */
export function usePostSeo() {
  const { options } = useOptions()

  /**
   * 获取当前页面完整URL
   * @returns {String} 完整URL
   */
  const getCurrentUrl = () => {
    const route = useRoute()
    const siteUrl = options.value?.siteUrl || ''
    return siteUrl + route.path
  }

  /**
   * 过滤HTML标签
   */
  const filterHtmlTag = str => {
    if (!str) {
      return ''
    }
    // 过滤 <style> 和 <script> 标签及其内容，其他 HTML 标签、换行符和空格
    return str.replace(
      /<(style|script)[^>]*>[\s\S]*?<\/\1>|<[^>]+>|\r?\n|\s/g,
      ''
    )
  }

  /**
   * 生成SEO图片URL
   * @param {Object} post - 文章数据
   * @returns {String} 完整的图片URL
   */
  const generateSeoImage = post => {
    if (!post || !options.value) return ''

    const siteUrl = options.value.siteUrl || ''
    let imageUrl = options.value.siteDefaultCover || ''

    if (post.coverImages && post.coverImages.length > 0) {
      const coverImage = post.coverImages[0]
      if (coverImage.thumfor) {
        imageUrl = coverImage.thumfor
      } else if (coverImage.filepath) {
        imageUrl = coverImage.filepath
      }
    }

    // 确保返回完整URL
    if (imageUrl && !imageUrl.startsWith('http')) {
      return siteUrl + imageUrl
    }
    return imageUrl
  }

  /**
   * 生成SEO标题
   * @param {Object} post - 文章数据
   * @returns {String} SEO标题
   */
  const generateSeoTitle = post => {
    if (!post) return ''

    let title = post.title || post.excerpt || ''
    const type = post.type

    // 推文类型需要智能裁切标题
    if (type === 2) {
      title = getTitleFromText(title)
    }

    return title
  }

  /**
   * 生成SEO描述
   * @param {Object} post - 文章数据
   * @returns {String} SEO描述
   */
  const generateSeoDescription = post => {
    if (!post) return ''

    let description = post.excerpt || filterHtmlTag(post.content) || ''

    // 超过200个字符，截取
    if (description.length > 200) {
      description = limitStr(description, 200)
    }

    // 将换行符替换为空格
    description = description.replace(/\r?\n/g, ' ')

    return description
  }

  /**
   * 生成SEO关键词
   * @param {Object} post - 文章数据
   * @returns {String} SEO关键词，逗号分隔
   */
  const generateSeoKeywords = post => {
    if (!post || !options.value) return options.value?.siteKeywords || ''

    const keyArray = [
      'bangumiList',
      'bookList',
      'gameList',
      'movieList',
      'mappointList',
      'tags',
      'contentBangumiList',
      'contentBookList',
      'contentGameList',
      'contentMovieList'
    ]

    const keywordsSet = new Set()
    for (const key of keyArray) {
      const list = post[key]
      if (!Array.isArray(list) || list.length === 0) continue
      if (key === 'tags') {
        for (const item of list) {
          if (item && item.tagname) keywordsSet.add(item.tagname)
        }
      } else {
        for (const item of list) {
          if (item && item.title) keywordsSet.add(item.title)
        }
      }
    }

    if (keywordsSet.size > 0) {
      let keywordsStr = Array.from(keywordsSet).join(',')
      // 结合站点默认关键词
      if (options.value.siteKeywords) {
        keywordsStr += ',' + options.value.siteKeywords
      }
      return keywordsStr
    }

    return options.value.siteKeywords || ''
  }

  /**
   * 获取封面图片的完整信息（包括宽高）
   * @param {Object} post - 文章数据
   * @returns {Object|null} 图片信息对象 {url, width, height}
   */
  const getCoverImageInfo = post => {
    if (!post || !options.value) return null

    const siteUrl = options.value.siteUrl || ''

    if (post.coverImages && post.coverImages.length > 0) {
      const coverImage = post.coverImages[0]
      let imageUrl = coverImage.filepath

      if (coverImage.thumfor) {
        imageUrl = coverImage.thumfor
      }

      // 确保URL完整
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = siteUrl + imageUrl
      }

      return {
        url: imageUrl,
        width: coverImage.width || undefined,
        height: coverImage.height || undefined
      }
    }

    // 使用默认封面
    if (options.value.siteDefaultCover) {
      const defaultUrl = options.value.siteDefaultCover.startsWith('http')
        ? options.value.siteDefaultCover
        : siteUrl + options.value.siteDefaultCover

      return {
        url: defaultUrl,
        width: undefined,
        height: undefined
      }
    }

    return null
  }

  /**
   * 生成作者完整信息
   * @param {Object} post - 文章数据
   * @returns {Object} 作者信息
   */
  const getAuthorInfo = post => {
    if (!post || !post.author || !options.value) {
      return {
        '@type': 'Organization',
        name: options.value?.siteTitle || ''
      }
    }

    const siteUrl = options.value.siteUrl || ''

    return {
      '@type': 'Person',
      name: post.author.nickname || post.author.username,
      url: siteUrl
    }
  }

  /**
   * 生成完整的SEO数据集
   * @param {Object} post - 文章数据
   * @returns {Object} 包含所有SEO数据的对象
   */
  const generatePostSeoData = post => {
    if (!post) return null

    return {
      title: generateSeoTitle(post),
      description: generateSeoDescription(post),
      keywords: generateSeoKeywords(post),
      image: generateSeoImage(post),
      url: getCurrentUrl(),
      coverImageInfo: getCoverImageInfo(post),
      authorInfo: getAuthorInfo(post)
    }
  }

  return {
    getCurrentUrl,
    filterHtmlTag,
    generateSeoImage,
    generateSeoTitle,
    generateSeoDescription,
    generateSeoKeywords,
    getCoverImageInfo,
    getAuthorInfo,
    generatePostSeoData
  }
}
