export function resolveSiteResourceUrl(resourcePath, siteUrl = '') {
  if (!resourcePath) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(resourcePath)) {
    return resourcePath
  }

  return `${siteUrl || ''}${resourcePath}`
}
