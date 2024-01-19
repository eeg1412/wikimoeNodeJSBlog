<template>
  <div class="blog-body">
    <NuxtLoadingIndicator color="#ef90a7" />
    <NuxtPage></NuxtPage>
    <UNotifications />
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
  meta: [
    { name: 'description', content: options.value.siteDescription },
    // name="keywords"
    { name: 'keywords', content: options.value.siteKeywords },
    // name="generator"
    { name: 'generator', content: 'wikimoeBlog' },
    // itemprop="name"
    { itemprop: 'name', content: options.value.siteTitle },
    // itemprop="image"
    {
      itemprop: 'image',
      content: options.value.siteUrl + options.value.siteDefaultCover,
    },
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
  ],
})
const postLogCreate = () => {
  const referrer = document.referrer
  postLogCreateApi({
    referrer: referrer,
    action: 'open',
  })
}

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
