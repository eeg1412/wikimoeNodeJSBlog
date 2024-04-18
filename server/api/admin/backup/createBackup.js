const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const backupTools = require('../../../utils/backup')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const moment = require('moment-timezone');

module.exports = async function (req, res, next) {

  const { name, remark } = req.body
  // 校验格式
  const params = {
    name,
    remark,
    fileStatus: 0,
    status: 0,
    type: 1
  }
  const rule = [
    {
      key: 'name',
      label: '备份名称',
      type: null,
      required: true,
    },

  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 查询有没有status=0的备份，如果有，不允许再次创建
  const backup = await backupUtils.findOne({ status: 0 }).catch((err) => {
    return null
  })
  if (backup) {
    res.status(400).json({
      errors: [{
        message: '已有备份正在进行中，请稍后再试'
      }]
    })
    return
  }

  // save
  backupUtils.save(params).then(async (data) => {
    res.send({
      data: data
    })

    const id = data._id
    // 文件名为当前时间戳YYYYMMDDHHmmss+id
    const pathname = `backup-${moment().format('YYYYMMDDHHmmss')}-${id}`
    try {
      await backupTools.dumpCollections(pathname, id)
      await backupTools.backupToZip(pathname)
      await backupTools.clearBackupCache(pathname)
    } catch (err) {
      backupUtils.updateOne({ _id: id }, { status: 2, fileStatus: 2, reason: logErrorToText(err) })
      adminApiLog.error(`backup create fail, ${logErrorToText(err)}`)
      return
    }
    backupUtils.updateOne({ _id: id }, { status: 1, fileStatus: 1, filename: `${pathname}.zip` })

    adminApiLog.info(`backup create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '备份创建失败'
      }]
    })
    adminApiLog.error(`backup create fail, ${logErrorToText(err)}`)
  })

}
