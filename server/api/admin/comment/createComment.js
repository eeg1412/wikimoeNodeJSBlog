const chalk = require('chalk')
const commentUtils = require('../../../mongodb/utils/comments')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const parser = require('ua-parser-js');

module.exports = async function (req, res, next) {

  const { post, parent, content, user, top } = req.body
  const ip = utils.getUserIp(req)
  // 校验格式
  const params = {
    post,
    parent,
    content,
    user,
    top,
    // 因为是后台接口，所以默认通过审核
    status: 1,
    ip: ip
  }
  const rule = [
    {
      key: 'post',
      label: '评论文章',
      type: null,
      required: true,
    },
    {
      key: 'content',
      label: '评论内容',
      type: null,
      required: true,
    },
    {
      key: 'user',
      label: '评论用户',
      type: null,
      required: true,
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // TODO:获取IP信息
  // TODO:获取设备信息
  const ua = parser(req.get('user-agent'))
  // save
  commentUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`comment:${commentname} create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '评论创建失败'
      }]
    })
    adminApiLog.error(`comment:${commentname} create fail, ${JSON.stringify(err)}`)
  })

}
