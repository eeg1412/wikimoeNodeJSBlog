const gameUtils = require('../../../mongodb/utils/games')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const nodePath = require('path')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const {
    gamePlatform,
    title,
    cover,
    summary,
    rating,
    label,
    screenshotAlbum,
    urlList,
    startTime,
    endTime,
    status,
    giveUp,
    postLinkOpen,
    id,
    __v
  } = req.body
  // 校验格式
  const params = {
    title,
    gamePlatform,
    summary,
    rating,
    label,
    screenshotAlbum,
    urlList,
    startTime,
    endTime,
    status,
    postLinkOpen,
    giveUp
  }
  const formCheck = {
    id,
    __v,
    ...params
  }
  const rule = [
    {
      key: 'id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: '__v',
      label: '__v',
      strict: true,
      strictType: 'number',
      required: true
    },
    {
      key: 'title',
      label: '游戏名称',
      type: null,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'gamePlatform',
      label: '游戏平台',
      type: 'isMongoId'
    },
    {
      key: 'screenshotAlbum',
      label: '截图相册',
      type: 'isMongoId'
    },
    {
      key: 'rating',
      label: '评分',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'status',
      label: '状态',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'giveUp',
      label: '弃坑',
      strict: true,
      strictType: 'boolean'
    },
    {
      key: 'postLinkOpen',
      label: '文章链接公开',
      strict: true,
      strictType: 'boolean'
    }
  ]
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  // urlList 检查
  if (!utils.checkStringList(urlList, ['text', 'url'])) {
    res.status(400).json({
      errors: [
        {
          message: '链接列表格式错误'
        }
      ]
    })
    return
  }

  const oldData = await gameUtils.findOne({ _id: id, __v })
  if (!oldData) {
    res.status(400).json({
      errors: [
        {
          message: '该数据不存在或已被更新'
        }
      ]
    })
    return
  }
  const base64Reg = /^data:image\/\w+;base64,/
  if (cover && base64Reg.test(cover)) {
    const coverFolder = oldData.coverFolder
    let path = './public/upload/gameCover/'
    if (coverFolder) {
      path = path + coverFolder + '/'
    }
    const fileName = id
    try {
      const imgRes = utils.base64ToFile(cover, path, fileName, {
        createDir: true
      })
      let baseCover = '/upload/gameCover/'
      // 拼接文件夹
      baseCover = baseCover + coverFolder + '/'
      params['cover'] = `${baseCover}${imgRes.fileNameAll}?v=${Date.now()}`
      params['coverFileName'] = imgRes.fileNameAll
    } catch (error) {
      res.status(400).json({
        errors: [
          {
            message: '照片上传失败'
          }
        ]
      })
      throw new Error(error)
    }
  } else if (cover === '' && oldData.coverFileName) {
    // 删除封面
    const coverFolder = oldData.coverFolder
    let path = './public/upload/gameCover/'
    path = path + coverFolder + '/'
    const fileName = oldData.coverFileName
    try {
      fs.unlinkSync(nodePath.join(path, fileName))
    } catch (error) {
      adminApiLog.error(`gameCover update cover fail, ${JSON.stringify(error)}`)
      res.status(400).json({
        errors: [
          {
            message: '旧图片删除失败'
          }
        ]
      })
      return
    }
    params['cover'] = null
    params['coverFileName'] = null
  }

  // updateOne
  gameUtils
    .updateOne({ _id: id, __v }, params)
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
      adminApiLog.info(`game update success`)
      cacheDataUtils.getPlayingGameList()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '游戏更新失败'
          }
        ]
      })
      adminApiLog.error(`game update fail, ${logErrorToText(err)}`)
    })
}
