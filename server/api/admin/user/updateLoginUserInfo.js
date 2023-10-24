const chalk = require('chalk')
const userUtils = require('../../../mongodb/utils/users')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { nickname, photo, email, description, currentPassword, password } = req.body

  // 更新
  const id = req.admin._id
  const updateData = {
    email,
    description,
  }
  if (nickname && nickname !== req.admin.nickname) {
    // 校验昵称是否重复
    const nickNameRes = await userUtils.findOne({ nickname })
    if (nickNameRes) {
      res.status(400).json({
        errors: [{
          message: '昵称已存在'
        }]
      })
      return
    }
    updateData['nickname'] = nickname
  }
  // 校验密码
  if (password) {
    // 有密码时需要校验密码
    const currentServerPassowrd = req.admin.password
    const checkRes = utils.checkBcryptStr(currentPassword, currentServerPassowrd)
    if (!checkRes) {
      res.status(400).json({
        errors: [{
          message: '当前密码不正确'
        }]
      })
      return
    }
    const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{4,}$/
    if (!passwordReg.test(password)) {
      // 密码必须4位以上且包含大小写和数字
      res.status(400).json({
        errors: [{
          message: '密码必须4位以上且包含大小写和数字'
        }]
      })
    }
    // 校验通过
    updateData['password'] = utils.creatBcryptStr(password)
    // pwversion + 1 
    updateData['pwversion'] = req.admin.pwversion + 1
  }

  // IP
  const IP = utils.getUserIp(req)
  updateData['IP'] = IP

  //照片上传
  //base64正则
  const base64Reg = /^data:image\/\w+;base64,/
  if (photo && base64Reg.test(photo)) {
    const path = './public/upload/avatar/'
    const fileName = req.admin._id
    try {
      const imgRes = utils.base64ToFile(photo, path, fileName)
      updateData['photo'] = `/upload/avatar/${imgRes.fileNameAll}?v=${Date.now()}`
    } catch (error) {
      res.status(400).json({
        errors: [{
          message: '照片上传失败'
        }]
      })
      throw new Error(error)
    }
  }

  // 更新数据库
  const __v = req.admin.__v
  const updateRes = await userUtils.updateOne({ _id: id, __v }, updateData)
  if (updateRes.modifiedCount === 0) {
    res.status(400).json({
      errors: [{
        message: '更新失败'
      }]
    })
    return
  }
  adminApiLog.info(`admin:${req.admin.nickname} - ${req.admin._id} update profile,IP:${IP}`)
  res.send({})
}
