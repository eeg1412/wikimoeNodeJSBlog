const backupUtils = require('../../../mongodb/utils/backups')
const log4js = require('log4js')
const fs = require('fs')

module.exports = async function (req, res, next) {
  const id = req.query.id;
  const fileSize = req.query.fileSize;
  if (!id) {
    res.status(400).json({
      errors: [{
        message: '备份id不能为空'
      }]
    })
    return
  }
  // 从数据库获取备份信息
  const backup = await backupUtils.findOne({ _id: id, status: 3, fileStatus: 3 })
  if (!backup) {
    res.status(400).json({
      errors: [{
        message: '备份不存在'
      }]
    })
    return
  }
  // 校验backup的fileSize和传入的fileSize是否一致
  if (backup.fileSize !== Number(fileSize)) {
    res.status(400).json({
      errors: [{
        message: '文件大小不一致'
      }]
    })
    return
  }

  const chunkDir = `./cache/${id}`
  // 如果备份目录不存在，则报错
  if (!fs.existsSync(chunkDir)) {
    res.status(400).json({
      errors: [{
        message: '备份文件不存在'
      }]
    })
    return
  }
  //  文件夹下的文件就是分片文件的index，将文件夹下的文件名返回给前端
  const files = fs.readdirSync(chunkDir)
  res.status(200).json({
    data: files
  })
}