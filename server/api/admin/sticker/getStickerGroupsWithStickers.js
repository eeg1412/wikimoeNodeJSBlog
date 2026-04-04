const stickerGroupUtils = require('../../../mongodb/utils/stickerGroups')
const stickerUtils = require('../../../mongodb/utils/stickers')

module.exports = async function (req, res, next) {
  try {
    const groups = await stickerGroupUtils.find(
      { status: 1 },
      { taxis: 1, _id: 1 },
      '_id name taxis',
      { lean: true }
    )

    const result = []
    for (const group of groups) {
      const stickers = await stickerUtils.find(
        { group: group._id, status: 1 },
        { taxis: 1, _id: 1 },
        '_id description image thumbnail width height thumWidth thumHeight',
        { lean: true }
      )
      if (stickers.length > 0) {
        result.push({
          _id: group._id,
          name: group.name,
          taxis: group.taxis,
          stickers: stickers
        })
      }
    }

    res.json({
      data: result
    })
  } catch (err) {
    next(err)
  }
}
