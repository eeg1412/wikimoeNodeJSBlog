import { resolveSiteResourceUrl } from '@/utils/site-resource-url'

export function useSiteDefaultCover() {
  const { options } = useOptions()

  const siteDefaultCover = computed(() => {
    const defaultCover = options.value?.siteDefaultCover
    if (!defaultCover) {
      return ''
    }

    return defaultCover
  })

  const siteDefaultCoverUrl = computed(() => {
    return resolveSiteResourceUrl(
      siteDefaultCover.value,
      options.value?.siteUrl
    )
  })

  return {
    siteDefaultCover,
    siteDefaultCoverUrl
  }
}
