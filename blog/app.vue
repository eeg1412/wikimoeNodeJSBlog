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
// const route = useRoute()
// const router = useRouter()
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
      href: options.value.siteUrl + '/rss/1',
    },
    // rss for tweet
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'RSS for tweet',
      href: options.value.siteUrl + '/rss/2',
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

// const checkLightbox = () => {
//   const lightboxopen = route.query.lightboxopen
//   if (lightboxopen === '1') {
//     // 尝试去缓存获取 lastlightboxData
//     const lastlightboxDataStr = localStorage.getItem('lastlightboxData')
//     let lastlightboxData = null
//     if (lastlightboxDataStr) {
//       // try catch转成json
//       try {
//         lastlightboxData = JSON.parse(lastlightboxDataStr)
//       } catch (error) {
//         lastlightboxData = null
//       }
//       if (lastlightboxData) {
//         loadAndOpenImg(lastlightboxData.index, lastlightboxData.dataSource)
//       } else {
//         // 没有缓存，清除参数
//         const nowQuery = route.query
//         delete nowQuery.lightboxopen
//         router.replace({
//           query: {
//             ...nowQuery,
//           },
//         })
//       }
//     }
//   }
// }
// // watch路由变化
// watch(
//   () => route.query.lightboxopen,
//   (newValue, oldValue) => {
//     if (newValue === '1') {
//       checkLightbox()
//     } else {
//       // 关闭lightbox
//       tryCloseLightbox()
//     }
//   }
// )
onMounted(() => {
  // 检查uuid
  checkUuid()
  // 获取referrer
  postLogCreate()
  // checkLightbox()
})
</script>
<style scoped>
.blog-body {
  font-size: 14px;
}
</style>
