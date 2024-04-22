const backupUtils = require('../../../mongodb/utils/backups')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const { Worker } = require('worker_threads');

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

    const backupWorker = new Worker('./utils/workers/backupWorker.js');
    const id = data._id;
    backupWorker.postMessage(String(id));

    backupWorker.on('message', (message) => {
      if (message.status === 'success') {
        backupUtils.updateOne({ _id: id }, { status: 1, fileStatus: 1, filename: `${message.data.pathname}.zip` });
      } else {
        backupUtils.updateOne({ _id: id }, { status: 2, fileStatus: 2, reason: logErrorToText(message.error) });
        adminApiLog.error(`backup create fail, ${logErrorToText(message.error)}`);
      }
      // 关闭 worker
      backupWorker.terminate().then(() => {
        console.log('Worker terminated');
      });
    });
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
