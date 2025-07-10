const utils = require('../../../utils/utils')
const log4js = require('log4js')

module.exports = async function (req, res, next) {
  const stats = await utils.getVoteLogsSize()
  res.send({
    stats,
  })
}
