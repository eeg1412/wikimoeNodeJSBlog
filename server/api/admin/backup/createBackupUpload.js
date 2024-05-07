const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment');
const fs = require('fs')

module.exports = async function (req, res, next) {

  const { fileName, fileSize } = req.body
  if (!fileName) {
    res.status(400).json({
      errors: [{
        message: '文件名不能为空'
      }]
    })
    return
  }
  if (!fileSize) {
    res.status(400).json({
      errors: [{
        message: '文件大小不能为空'
      }]
    })
    return
  }

  function isPositiveInteger (n) {
    return Number.isInteger(n) && n > 0;
  }

  // fileSize 必须是正整数
  if (!isPositiveInteger(fileSize)) {
    res.status(400).json({
      errors: [{
        message: '文件大小必须是正整数'
      }]
    })
    return
  }
  // 校验格式
  const params = {
    name: `用户上传的备份文件`,
    remark: `用户上传的备份文件，文件名：${fileName}，上传时间：${moment().format('YYYY-MM-DD HH:mm:ss')}`,
    fileStatus: 3,
    fileSize: fileSize,
    status: 3,
    type: 1
  }


  // save
  backupUtils.save(params).then(async (data) => {
    // 在./cache创建一个文件夹，文件夹名字是备份的id
    // 需要先检查./cache文件夹是否存在，不存在则创建
    const cacheDir = `./cache/${data._id}`
    // 如果备份目录不存在，则创建
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    res.send({
      data: data
    })
    adminApiLog.info(`backup document create success`)
  }).catch((err) => {
    console.error(err)
    res.status(400).json({
      errors: [{
        message: '备份创建失败'
      }]
    })
    adminApiLog.error(`backup document create fail, ${logErrorToText(err)}`)
  })

}
