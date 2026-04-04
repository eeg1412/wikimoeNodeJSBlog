const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const stickerUtils = require('../../../mongodb/utils/stickers')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  try {
    // 只获取显示中的贴纸组
    const groups = await stickerGroupUtils.find(
      { status: 1 },
      { taxis: 1, createdAt: 1 },
      '_id name taxis',
      { lean: true }
    )

    // 获取每个组内显示中的贴纸
    const result = await Promise.all(
      groups.map(async group => {
        const stickers = await stickerUtils.find(
          { group: group._id, status: 1 },
          { taxis: 1, createdAt: 1 },
          '_id description image thumbnail width height thumWidth thumHeight',
          { lean: true }
        )
        return {
          ...group,
          stickers: stickers
        }
      })
    )

    // 过滤掉没有贴纸的组
    const filteredResult = result.filter(group => group.stickers.length > 0)

    res.send({
      list: filteredResult
    })
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '获取贴纸列表失败' }]
    })
    userApiLog.error(`sticker groups list fail, ${logErrorToText(err)}`)
  }
}
