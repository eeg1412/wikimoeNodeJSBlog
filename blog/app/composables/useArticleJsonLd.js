/**
 * Article JSON-LD 结构化数据生成器
 * 用于生成符合 Schema.org 标准的文章结构化数据
 * 支持博客文章(type=1)、推文(type=2)、页面(type=3)
 */
export function useArticleJsonLd() {
  const { options } = useOptions()
  const {
    generateSeoTitle,
    generateSeoDescription,
    generateSeoKeywords,
    getCoverImageInfo,
    getAuthorInfo
  } = usePostSeo()

  /**
   * 生成单篇文章的 JSON-LD
   * @param {Object} post - 文章数据对象
   * @param {Number} post.type - 文章类型：1=blog, 2=tweet, 3=page
   * @param {Object} seoData - 可选的已计算SEO数据，避免重复计算
   * @returns {Object} JSON-LD 结构化数据
   */
  function generateArticleJsonLd(post, seoData = null) {
    if (!post || !options.value) return null

    const config = useRuntimeConfig()
    const route = useRoute()

    // 基础 URL
    const siteUrl = options.value.siteUrl || config.public.siteUrl || ''
    const postUrl = `${siteUrl}${route.path}`

    // 根据文章类型决定 @type
    let articleType = 'Article'
    if (post.type === 1) {
      articleType = 'BlogPosting'
    } else if (post.type === 2) {
      articleType = 'SocialMediaPosting'
    } else if (post.type === 3) {
      articleType = 'WebPage'
    }

    // 使用传入的SEO数据或重新计算（优先使用已计算的）
    const seoTitle = seoData?.title || generateSeoTitle(post)
    const seoDescription = seoData?.description || generateSeoDescription(post)
    const seoKeywords = seoData?.keywords || generateSeoKeywords(post)
    const coverImageInfo = seoData?.coverImageInfo || getCoverImageInfo(post)
    const authorInfo = seoData?.authorInfo || getAuthorInfo(post)

    // 基础 JSON-LD 结构
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': articleType,
      headline: seoTitle || '无标题',
      author: authorInfo,
      datePublished: post.date || post.createDate,
      url: postUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl
      },
      publisher: {
        '@type': 'Organization',
        name: options.value.siteTitle,
        logo: {
          '@type': 'ImageObject',
          url:
            options.value.siteLogo && options.value.siteLogo.startsWith('http')
              ? options.value.siteLogo
              : siteUrl + (options.value.siteLogo || '')
        }
      }
    }

    // 添加dateModified
    if (post.updatedAt) {
      jsonLd.dateModified = post.updatedAt
    }

    // 添加描述（可选，但建议有）
    if (seoDescription) {
      jsonLd.description = seoDescription
    }

    // 添加图片（如果存在，包含宽高）
    if (coverImageInfo) {
      jsonLd.image = {
        '@type': 'ImageObject',
        url: coverImageInfo.url
      }
      if (coverImageInfo.width) {
        jsonLd.image.width = coverImageInfo.width
      }
      if (coverImageInfo.height) {
        jsonLd.image.height = coverImageInfo.height
      }
    }

    // 添加关键词（如果存在）
    if (seoKeywords) {
      jsonLd.keywords = seoKeywords
    }

    // 添加文章分类（如果存在）
    if (post.sort && post.sort.sortname) {
      jsonLd.articleSection = post.sort.sortname
    }

    // 添加字数统计（如果存在）
    if (post.wordsCount) {
      jsonLd.wordCount = post.wordsCount
    }

    // 添加评论数（如果存在）
    if (post.commentCount !== undefined) {
      jsonLd.commentCount = post.commentCount
    }

    // 添加互动统计（阅读数）
    if (post.views !== undefined) {
      jsonLd.interactionStatistic = {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: post.views
      }
    }

    // 为博客文章添加额外的字段
    if (post.type === 1 && post.tags && post.tags.length > 0) {
      jsonLd.about = post.tags.map(tag => ({
        '@type': 'Thing',
        name: tag.tagname
      }))
    }

    return jsonLd
  }

  /**
   * 生成文章列表的 JSON-LD (ItemList)
   * @param {Array} posts - 文章列表数组
   * @param {String} listName - 列表名称（如"首页"、"标签文章"等）
   * @returns {Object} JSON-LD 结构化数据
   */
  function generateItemListJsonLd(posts, listName = '文章列表') {
    if (!posts || !Array.isArray(posts) || posts.length === 0) return null
    if (!options.value) return null

    const config = useRuntimeConfig()
    const route = useRoute()
    const siteUrl = options.value.siteUrl || config.public.siteUrl || ''
    const currentUrl = `${siteUrl}${route.path}`

    const listItems = posts.map((post, index) => {
      const postUrl =
        post.type === 3
          ? `${siteUrl}/page/${post.alias || post._id}`
          : `${siteUrl}/post/${post.alias || post._id}`

      // 推文类型必须使用智能标题裁切
      let itemName
      if (post.type === 2) {
        itemName = generateSeoTitle(post) || '推文'
      } else {
        itemName = post.title || '无标题'
      }

      // 根据文章类型确定 @type
      let articleType = 'Article'
      if (post.type === 1) {
        articleType = 'BlogPosting'
      } else if (post.type === 2) {
        articleType = 'SocialMediaPosting'
      } else if (post.type === 3) {
        articleType = 'WebPage'
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': articleType,
          url: postUrl,
          headline: itemName
        }
      }
    })

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: listName,
      url: currentUrl,
      numberOfItems: posts.length,
      itemListElement: listItems
    }
  }

  /**
   * 设置 JSON-LD 到页面 head
   * @param {Object|Array} jsonLdData - JSON-LD 数据对象或数组
   */
  function setJsonLd(jsonLdData) {
    if (!jsonLdData) return

    // 支持传入数组（多个 JSON-LD）
    const dataArray = Array.isArray(jsonLdData) ? jsonLdData : [jsonLdData]

    // 过滤掉 null 值
    const validData = dataArray.filter(data => data !== null)

    if (validData.length === 0) return

    useHead({
      script: validData.map(data => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data)
      }))
    })
  }

  return {
    generateArticleJsonLd,
    generateItemListJsonLd,
    setJsonLd
  }
}
