const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const stickerUtils = require('../../../mongodb/utils/stickers')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id } = req.query
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: 'id格式错误'
        }
      ]
    })
    return
  }

  try {
    const data = await stickerGroupUtils.findOne({ _id: id })
    if (!data) {
      res.status(400).json({
        errors: [
          {
            message: '贴纸组不存在'
          }
        ]
      })
      return
    }

    // 获取该组的所有贴纸
    const stickers = await stickerUtils.find(
      { group: id },
      { taxis: 1, createdAt: 1 },
      null,
      { lean: true }
    )

    res.send({
      data: {
        ...data.toJSON(),
        stickers: stickers
      }
    })
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '获取贴纸组详情失败'
        }
      ]
    })
    adminApiLog.error(`stickerGroup detail fail, ${logErrorToText(err)}`)
  }
}
