module.exports = async function (req, res, next) {
  const siteSettings = global.$globalConfig.siteSettings

  res.setHeader('Content-Type', 'application/manifest+json')
  res.send({
    name: siteSettings.siteTitle || '',
    short_name: siteSettings.siteTitle || '',
    description: siteSettings.siteDescription || '',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ef90a7',
    icons: [
      {
        src: siteSettings.siteFavicon,
        sizes: '256x256',
        type: 'image/png'
      }
    ]
  })
}
