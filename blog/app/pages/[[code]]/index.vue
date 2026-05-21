<template>
  <div>
    <NuxtLayout>
      <NuxtPage></NuxtPage>
    </NuxtLayout>
  </div>
</template>
<script setup>
import {
  DEFAULT_LANGUAGE_CODE,
  getLanguageText,
  normalizeLanguageCode
} from '@/lang'

const route = useRoute()

const { options } = useOptions()

function getRouteCode() {
  const code = route.params.code

  if (Array.isArray(code)) {
    return code[0]
  }

  return code
}

const currentLanguageCode = computed(() => {
  return normalizeLanguageCode(getRouteCode()) || DEFAULT_LANGUAGE_CODE
})

const siteEnableRss = options.value.siteEnableRss
const rssHead = () => {
  if (siteEnableRss) {
    const siteUrl = options.value.siteUrl
    const languageCode = currentLanguageCode.value

    return [
      // rel="alternate" type="application/rss+xml" title="RSS"
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: getLanguageText(languageCode, 'common.footer.rssAllTitle'),
        href: `${siteUrl}/${languageCode}/rss`
      },
      // rss for blog
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: getLanguageText(languageCode, 'common.footer.rssBlogTitle'),
        href: `${siteUrl}/${languageCode}/rss/blog`
      },
      // rss for tweet
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: getLanguageText(languageCode, 'common.footer.rssTweetTitle'),
        href: `${siteUrl}/${languageCode}/rss/tweet`
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
