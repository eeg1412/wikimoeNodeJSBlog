const bannerUtils = require('../../../mongodb/utils/banners')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')
const path = require('path')
const fs = require('fs')

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
  // 获取旧数据
  const oldData = await bannerUtils.findOne({ _id: id })
  if (!oldData) {
    res.status(400).json({
      errors: [
        {
          message: '该数据不存在',
        },
      ],
    })
    return
  }
  // 删除图片
  if (oldData.imgPath) {
    // 拼接文件夹
    const imgPath = oldData.imgPath
    // 删除旧图片
    try {
      const oldPath = path.join('./', imgPath)
      fs.unlinkSync(oldPath)
    } catch (error) {
      res.status(400).json({
        errors: [
          {
            message: '旧图片删除失败',
          },
        ],
      })
      throw new Error(error)
    }
  }

  //  删除横幅
  bannerUtils
    .deleteOne({ _id: id })
    .then((data) => {
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败',
            },
          ],
        })
        return
      }
      res.send({
        data: {
          message: '删除成功',
        },
      })
      cacheDataUtils.getBannerList()
      // utils.reflushBlogCache()
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败',
          },
        ],
      })
      adminApiLog.error(`banner delete fail, ${logErrorToText(err)}`)
    })
}
