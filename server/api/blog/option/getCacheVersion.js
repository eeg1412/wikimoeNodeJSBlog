module.exports = async function (req, res, next) {
  res.send({
    data: {
      cacheVersion: global.$cacheVersion || 0
    }
  })
}
