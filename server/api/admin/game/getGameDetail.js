const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空',
        },
      ],
    })
    return
  }
  // findOne
  gameUtils
    .findOne({ _id: id })
    .then((data) => {
      if (!data) {
        res.status(400).json({
          errors: [
            {
              message: '游戏不存在',
            },
          ],
        })
        return
      }
      res.send({
        data: data,
      })
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '游戏详情获取失败',
          },
        ],
      })
      adminApiLog.error(`game detail get fail, ${logErrorToText(err)}`)
    })
}
