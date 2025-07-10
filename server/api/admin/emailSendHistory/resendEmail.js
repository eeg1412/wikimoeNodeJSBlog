const emailSendHistoryUtils = require('../../../mongodb/utils/emailSendHistorys')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id } = req.body
  // 查询id是否存在
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: '参数错误',
        },
      ],
    })
    return
  }

  const emailData = await emailSendHistoryUtils.findOne({ _id: id })
  if (!emailData) {
    res.status(400).json({
      errors: [
        {
          message: '邮件发送记录不存在',
        },
      ],
    })
    return
  }

  const email = {
    to: emailData.to,
    subject: emailData.subject,
    content: emailData.content,
  }
  // 发送邮件
  utils.sendEmail(email.to, email.content, email.subject)
  // 返回成功
  res.send({
    message: '已重新发送邮件',
  })
}
