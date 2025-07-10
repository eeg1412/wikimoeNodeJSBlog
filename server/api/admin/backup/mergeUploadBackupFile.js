const backupUtils = require('../../../mongodb/utils/backups')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment')
const fs = require('fs')
const fsEX = require('fs-extra')

module.exports = async function (req, res, next) {
  const id = req.body.id
  const backup = await backupUtils.findOne({
    _id: id,
    status: 3,
    fileStatus: 3
  })
  if (!backup) {
    res.status(400).json({
      errors: [
        {
          message: '备份不存在'
        }
      ]
    })
    return
  }
  const fileName = `backup-${moment().format('YYYYMMDDHHmmss')}-${backup._id}.zip`
  const cacheDir = `./cache/${backup._id}`
  const backupDir = `./backups`
  // 如果备份目录不存在，则创建
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  // 合并文件
  const files = fs.readdirSync(cacheDir)
  const fileSize = backup.fileSize
  // 校验文件大小
  let totalSize = 0
  for (let i = 0; i < files.length; i++) {
    const stat = fs.statSync(`${cacheDir}/${files[i]}`)
    totalSize += stat.size
  }
  if (totalSize !== fileSize) {
    res.status(400).json({
      errors: [
        {
          message: '文件大小不一致, 合并失败'
        }
      ]
    })
    return
  }
  files.sort((a, b) => Number(a) - Number(b))
  console.log('开始合并文件')
  const writeStream = fs.createWriteStream(`${backupDir}/${fileName}`)
  writeStream.on('error', function (err) {
    adminApiLog.error(`merge file fail, ${logErrorToText(err)}`)
    res.status(400).json({
      errors: [
        {
          message: '合并文件失败'
        }
      ]
    })
  })
  for await (const file of files) {
    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(`${cacheDir}/${file}`)
      readStream.on('error', reject)
      readStream.on('end', resolve)
      readStream.pipe(writeStream, { end: false })
    })
    console.log(`合并文件${file}完成`)
  }
  // 关闭写入流
  writeStream.end()

  await fsEX.remove(cacheDir)
  // 更新备份记录
  await backupUtils.updateOne(
    { _id: id },
    { fileStatus: 1, status: 1, filename: fileName }
  )
  res.status(200).json({
    data: {
      fileName
    }
  })
  console.log('合并文件完成')
}
