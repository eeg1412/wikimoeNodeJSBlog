const gamePlatformUtils = require('../../../mongodb/utils/gamePlatforms')
const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!utils.isObjectId(id)) {
    res.status(400).json({ errors: [{ message: 'id格式错误' }] })
    return
  }
  // 查看对应游戏数量
  const gameCount = await gameUtils.count({ gamePlatform: id })
  if (gameCount > 0) {
    res.status(400).json({
      errors: [
        {
          message: '该平台下有游戏，不能删除'
        }
      ]
    })
    return
  }
  //  删除游戏平台
  gamePlatformUtils
    .deleteOne({ _id: id })
    .then(data => {
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败'
            }
          ]
        })
        return
      }
      res.send({
        data: {
          message: '删除成功'
        }
      })
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败'
          }
        ]
      })
      adminApiLog.error(`gamePlatform delete fail, ${logErrorToText(err)}`)
    })
}
