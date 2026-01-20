const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id, postLinkOpen } = req.body
  const params = { id, postLinkOpen }
  const rule = [
    { key: 'id', label: 'id', type: 'isMongoId', required: true },
    {
      key: 'postLinkOpen',
      label: '文章链接开关',
      strict: true,
      strictType: 'boolean',
      required: true
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const updateData = {
    postLinkOpen: postLinkOpen
  }

  gameUtils
    .updateOne({ _id: id }, updateData)
    .then(data => {
      if (data.modifiedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
      adminApiLog.info(`game update postLinkOpen success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '游戏文章链接开关更新失败'
          }
        ]
      })
      adminApiLog.error(`game update postLinkOpen fail, ${logErrorToText(err)}`)
    })
}
