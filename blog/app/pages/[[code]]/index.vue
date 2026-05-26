<template>
  <NuxtPage></NuxtPage>
</template>
<script setup>
import { getLanguageText, normalizeLanguageCode } from '@/lang'
import { resolveDefaultLanguageCode } from '@/utils/default-language'
import {
  buildSeoResourcePath,
  getRouteCode as getRouteCodeFromRoute
} from '~/composables/useLang'

const route = useRoute()

const {
  options,
  createLanguageNotFoundError,
  SITE_MULTILINGUAL_DISABLED_REASON
} = useOptions()

function getCurrentRouteCode() {
  return getRouteCodeFromRoute(route)
}

const currentLanguageCode = computed(() => {
  const routeLanguageCode = normalizeLanguageCode(getCurrentRouteCode())
  if (routeLanguageCode) {
    return routeLanguageCode
  }

  return resolveDefaultLanguageCode(options.value)
})

const isLocalizedRoute = computed(() => {
  return Boolean(getCurrentRouteCode())
})

const shouldRequireMultilingualSite = computed(() => {
  return isLocalizedRoute.value
})

const isSiteMultilingualEnabled = computed(() => {
  return options.value?.siteEnableMultilingual === true
})

if (shouldRequireMultilingualSite.value && !isSiteMultilingualEnabled.value) {
  throw createLanguageNotFoundError(SITE_MULTILINGUAL_DISABLED_REASON)
}

const siteEnableRss = options.value.siteEnableRss
const getSeoResourceUrl = path => {
  const siteUrl = options.value.siteUrl
  const resourcePath = buildSeoResourcePath(
    currentLanguageCode.value,
    path,
    isLocalizedRoute.value
  )
  return `${siteUrl}${resourcePath}`
}
const rssHead = () => {
  if (siteEnableRss) {
    const languageCode = currentLanguageCode.value

    return [
      // rel="alternate" type="application/rss+xml" title="RSS"
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: getLanguageText(languageCode, 'common.footer.rssAllTitle'),
        href: getSeoResourceUrl('/rss')
      },
      // rss for blog
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: getLanguageText(languageCode, 'common.footer.rssBlogTitle'),
        href: getSeoResourceUrl('/rss/blog')
      },
      // rss for tweet
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: getLanguageText(languageCode, 'common.footer.rssTweetTitle'),
        href: getSeoResourceUrl('/rss/tweet')
      }
    ]
  } else {
    return []
  }
}

const panoramaEnterModeTip = computed(() => {
  return getLanguageText(
    currentLanguageCode.value,
    'common.panorama.enterModeTip'
  )
})
useHead(() => {
  const siteDefaultCover = options.value.siteDefaultCover || ''
  const siteFavicon = options.value.siteFavicon || ''
  const htmlStyle = `--w-panorama-enter-mode-tip: ${JSON.stringify(
    panoramaEnterModeTip.value
  )};`
  const meta = [
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
    // twitter
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:site', content: `@${options.value.siteTitle}` },
    { name: 'twitter:title', content: options.value.siteTitle },
    { name: 'twitter:description', content: options.value.siteDescription },
    // robots meta，允许大图预览
    { name: 'robots', content: 'max-image-preview:large' }
  ]
  const link = [...rssHead()]

  if (siteDefaultCover) {
    let siteDefaultCoverUrl = siteDefaultCover

    if (!siteDefaultCover.startsWith('http')) {
      siteDefaultCoverUrl = options.value.siteUrl + siteDefaultCover
    }

    meta.push({ property: 'og:image', content: siteDefaultCoverUrl })
    meta.push({ name: 'twitter:image', content: siteDefaultCoverUrl })
  }

  if (siteFavicon) {
    link.unshift(
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: siteFavicon
      },
      {
        rel: 'apple-touch-icon',
        sizes: '256x256',
        href: siteFavicon
      }
    )
  }

  return {
    titleTemplate: titleChunk => {
      const siteTitle = options.value.siteTitle || ''
      const siteSubTitle = options.value.siteSubTitle || ''

      if (!titleChunk) {
        return siteTitle
      }

      if (titleChunk === siteSubTitle) {
        return [siteTitle, titleChunk].filter(Boolean).join(' | ')
      }

      if (siteTitle) {
        return `${titleChunk} - ${siteTitle}`
      }

      return titleChunk
    },
    title: options.value.siteSubTitle,
    htmlAttrs: {
      lang: currentLanguageCode.value,
      style: htmlStyle
    },
    meta,
    link
  }
})
</script>
