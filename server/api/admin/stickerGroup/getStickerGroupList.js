const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const stickerUtils = require('../../../mongodb/utils/stickers')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  try {
    const sort = { taxis: 1, createdAt: 1 }
    const list = await stickerGroupUtils.find({}, sort, null, { lean: true })

    // 为每个贴纸组获取第一个贴纸作为封面
    const groupIds = list.map(item => item._id)
    const coverStickers = await Promise.all(
      groupIds.map(groupId =>
        stickerUtils
          .find({ group: groupId }, { taxis: 1, createdAt: 1 }, null, {
            lean: true
          })
          .then(stickers => ({
            groupId: groupId.toString(),
            firstSticker: stickers.length > 0 ? stickers[0] : null,
            stickerCount: stickers.length
          }))
      )
    )

    const coverMap = {}
    coverStickers.forEach(item => {
      coverMap[item.groupId] = {
        firstSticker: item.firstSticker,
        stickerCount: item.stickerCount
      }
    })

    const result = list.map(item => {
      const info = coverMap[item._id.toString()] || {}
      return {
        ...item,
        coverSticker: info.firstSticker || null,
        stickerCount: info.stickerCount || 0
      }
    })

    res.send({
      list: result
    })
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          message: '获取贴纸组列表失败'
        }
      ]
    })
    adminApiLog.error(`stickerGroup list fail, ${logErrorToText(err)}`)
  }
}
