const updatePostLinkOpenCommon = require('../../../utils/updatePostLinkOpenCommon')

module.exports = async function (req, res, next) {
  return updatePostLinkOpenCommon('bangumi', req, res, next)
}
