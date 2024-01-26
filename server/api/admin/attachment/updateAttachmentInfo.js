const attachmentUtils = require('../../../mongodb/utils/attachments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const pathModule = require('path');

module.exports = async function (req, res, next) {
  // name	String	是	否	无	媒体名称
  const { name, id, __v, videoCover } = req.body
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [{
        message: '__v不能为空'
      }]
    })
    return
  }
  // 校验格式
  const params = {
    name: name,
  }
  const rule = [
    {
      key: 'name',
      label: '媒体名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 校验是否存在
  const oldData = await attachmentUtils.findOne({ _id: id })
  if (!oldData) {
    res.status(400).json({
      errors: [{
        message: '媒体不存在'
      }]
    })
    return
  }
  const isVideo = oldData.mimetype.includes('video')
  const base64Reg = /^data:image\/\w+;base64,/
  // 如果是视频且有封面
  if (isVideo && videoCover) {
    // 如果是base64
    if (base64Reg.test(videoCover)) {
      // 保存新的封面
      const oldFullpath = './public' + oldData.thumfor
      // path会携带路径和文件名，拆分成path和fileName
      const path = pathModule.dirname(oldFullpath);  // '/user/local'
      const ext = pathModule.extname(oldFullpath);
      const fileName = pathModule.basename(oldFullpath, ext);
      utils.base64ToFile(videoCover, path, fileName, { createDir: false })
    }
  }


  // updateOne
  attachmentUtils.updateOne({ _id: id, __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    res.send({
      data: data
    })
    adminApiLog.info(`attachment:${name} update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '媒体更新失败'
      }]
    })
    adminApiLog.error(`attachment:${name} update fail, ${logErrorToText(err)}`)
  })
}
