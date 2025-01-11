<template>
  <div class="blog-body">
    <NuxtLoadingIndicator color="#ef90a7" />
    <NuxtPage></NuxtPage>
    <UNotifications />
    <PhotoSwipe />
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { useIsFullscreenStore } from '@/store/isFullscreen'
import { storeToRefs } from 'pinia'
import { postLogCreateApi, putLogUpdatePerformanceApi } from '@/api/log'

const optionStore = useOptionStore()
const { getOptions } = optionStore
await getOptions()
const { options } = storeToRefs(optionStore)
const siteEnableRss = options.value.siteEnableRss
const rssHead = () => {
  if (siteEnableRss) {
    return [
      // rel="alternate" type="application/rss+xml" title="RSS"
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'RSS',
        href: options.value.siteUrl + '/rss',
      },
      // rss for blog
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'RSS for blog',
        href: options.value.siteUrl + '/rss/blog',
      },
      // rss for tweet
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'RSS for tweet',
        href: options.value.siteUrl + '/rss/tweet',
      },
    ]
  } else {
    return []
  }
}
const script = []
// console.log(options)
if (options.value.googleAdEnabled) {
  script.push({
    src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${options.value.googleAdId}`,
    async: true,
    crossorigin: 'anonymous',
  })
}

useHead({
  titleTemplate: (titleChunk) => {
    if (!titleChunk) {
      return options.value.siteTitle
    } else if (titleChunk === options.value.siteSubTitle) {
      return `${options.value.siteTitle} | ${titleChunk}`
    } else {
      return `${titleChunk} - ${options.value.siteTitle}`
    }
  },
  title: options.value.siteSubTitle,
  htmlAttrs: {
    lang: 'zh-hans',
  },
  meta: [
    { name: 'description', content: options.value.siteDescription },
    // name="keywords"
    { name: 'keywords', content: options.value.siteKeywords },
    // name="generator"
    { name: 'generator', content: 'wikimoeBlog' },
    // theme-color
    { name: 'theme-color', content: '#ef90a7' },
    // OGP
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: options.value.siteTitle },
    { property: 'og:title', content: options.value.siteTitle },
    { property: 'og:description', content: options.value.siteDescription },
    { property: 'og:url', content: options.value.siteUrl },
    {
      property: 'og:image',
      content: options.value.siteUrl + options.value.siteDefaultCover,
    },
    // twitter
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:site', content: `@${options.value.siteTitle}` },
    { name: 'twitter:title', content: options.value.siteTitle },
    { name: 'twitter:description', content: options.value.siteDescription },
    {
      name: 'twitter:image',
      content: options.value.siteUrl + options.value.siteDefaultCover,
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: options.value.siteFavicon,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '256x256',
      href: options.value.siteFavicon,
    },
    // rss
    ...rssHead(),
  ],
  script: script,
})
const getPerformanceNavigationTiming = () => {
  let dataContentObj = null
  try {
    const navTiming = performance.getEntriesByType('navigation')[0]
    dataContentObj = {
      connectDuration:
        typeof navTiming.connectEnd === 'number' &&
        typeof navTiming.connectStart === 'number'
          ? Math.floor(navTiming.connectEnd) -
            Math.floor(navTiming.connectStart)
          : null,
      domComplete:
        typeof navTiming.domComplete === 'number'
          ? Math.floor(navTiming.domComplete)
          : null,
      domInteractive:
        typeof navTiming.domInteractive === 'number'
          ? Math.floor(navTiming.domInteractive)
          : null,
      domainLookupDuration:
        typeof navTiming.domainLookupEnd === 'number' &&
        typeof navTiming.domainLookupStart === 'number'
          ? Math.floor(navTiming.domainLookupEnd) -
            Math.floor(navTiming.domainLookupStart)
          : null,
      duration:
        typeof navTiming.duration === 'number'
          ? Math.floor(navTiming.duration)
          : null,
      loadEventDuration:
        typeof navTiming.loadEventEnd === 'number' &&
        typeof navTiming.loadEventStart === 'number'
          ? Math.floor(navTiming.loadEventEnd) -
            Math.floor(navTiming.loadEventStart)
          : null,
      redirectCount:
        typeof navTiming.redirectCount === 'number'
          ? navTiming.redirectCount
          : null,
      entryType: navTiming.entryType || null,
      name: navTiming.name || null,
      type: navTiming.type || null,
    }
  } catch (e) {
    dataContentObj = null
  }
  return dataContentObj
}
let openLogId = null
const postLogCreate = () => {
  const referrer = document.referrer
  let dataContentObj = getPerformanceNavigationTiming()

  let performanceNavigationTiming = null
  const duration = dataContentObj?.duration || 0
  if (dataContentObj && duration > 0) {
    performanceNavigationTiming = dataContentObj
  }
  postLogCreateApi({
    referrer: referrer,
    action: 'open',
    performanceNavigationTiming: performanceNavigationTiming,
  }).then((res) => {
    openLogId = res.id
    // 如果 performanceNavigationTiming的duration为0，则250毫秒后再次获取
    if (dataContentObj && duration === 0) {
      setTimeout(() => {
        updatePerformance()
      }, 100)
    }
  })
}

let tryCount = 0
const updatePerformance = () => {
  const performanceNavigationTiming = getPerformanceNavigationTiming()
  if (performanceNavigationTiming && performanceNavigationTiming.duration > 0) {
    putLogUpdatePerformanceApi({
      id: openLogId,
      action: 'open',
      performanceNavigationTiming: performanceNavigationTiming,
    })
  } else if (tryCount < 60) {
    setTimeout(() => {
      updatePerformance()
    }, 1000)
    tryCount++
  }
}

const setStyle = () => {
  // 如果存在 options.siteExtraCss
  if (options.value.siteExtraCss) {
    useHead({
      style: [options.value.siteExtraCss],
    })
  }
}
setStyle()

// useIsFullscreenStore
const isFullscreenStore = useIsFullscreenStore()
const { setFullscreen } = isFullscreenStore

// 全屏状态变化时的回调函数
const onFullscreenChange = () => {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  ) {
    console.log('进入全屏')
    // 进入全屏后的逻辑
    setFullscreen(true)
  } else {
    console.log('退出全屏')
    // 退出全屏后的逻辑
    setFullscreen(false)
  }
}

// 添加全屏事件监听器
const addFullscreenChangeListener = () => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  document.addEventListener('mozfullscreenchange', onFullscreenChange)
}

// 移除全屏事件监听器
const removeFullscreenChangeListener = () => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  document.removeEventListener('mozfullscreenchange', onFullscreenChange)
}

onMounted(() => {
  // 检查uuid
  checkUuid()
  // 获取referrer
  postLogCreate()
  addFullscreenChangeListener()
})
onUnmounted(() => {
  removeFullscreenChangeListener()
})
</script>
<style scoped>
.blog-body {
  font-size: 14px;
}
</style>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
