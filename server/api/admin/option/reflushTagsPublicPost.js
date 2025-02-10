const reflushData = require('../../../utils/reflushData')


module.exports = async function (req, res, next) {
  res.send({
    message: '提交成功，正在统计'
  })
  global.$isReady = false
  await reflushData.refreshTagsPublicPost()
  global.$isReady = true
}