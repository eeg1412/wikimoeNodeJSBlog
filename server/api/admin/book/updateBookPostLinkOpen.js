const updatePostLinkOpenCommon = require('../updatePostLinkOpenCommon')

module.exports = async function (req, res, next) {
  return updatePostLinkOpenCommon('book', req, res, next)
}
