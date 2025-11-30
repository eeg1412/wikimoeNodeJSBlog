module.exports = async function (req, res, next) {
  if (!global.$globalConfig?.swrCacheSettings) {
    res.send({
      data: {
        swrCacheEnabled: false,
        swrCacheMaxAge: 10,
        swrCacheStaleMaxAge: 3600
      }
    })
    return
  }

  res.send({
    data: global.$globalConfig.swrCacheSettings
  })
}
