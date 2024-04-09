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
import { storeToRefs } from 'pinia'
import { postLogCreateApi } from '@/api/log'

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
    // rss
    ...rssHead(),
  ],
})
const postLogCreate = () => {
  const referrer = document.referrer
  postLogCreateApi({
    referrer: referrer,
    action: 'open',
  })
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

onMounted(() => {
  // 检查uuid
  checkUuid()
  // 获取referrer
  postLogCreate()
})
</script>
<style scoped>
.blog-body {
  font-size: 14px;
}
</style>
