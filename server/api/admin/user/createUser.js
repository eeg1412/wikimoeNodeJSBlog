const userUtils = require('../../../mongodb/utils/users')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const mongoose = require('mongoose')

module.exports = async function (req, res, next) {
  const { username, nickname, photo, email, description, password, cover } =
    req.body

  const params = {
    username,
    nickname,
    email,
    description,
    password,
    role: 990,
    cover
  }
  const rule = [
    {
      key: 'username',
      label: '用户名',
      type: 'regCheck',
      reg: /^[a-z0-9]+$/,
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      // nickname
      key: 'nickname',
      label: '昵称',
      type: 'regCheck',
      // 10以内的文字
      reg: /^.{1,10}$/,
      required: true,
      strict: true,
      strictType: 'string'
    },
    // password
    {
      key: 'password',
      label: '密码',
      type: 'regCheck',
      reg: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/,
      required: true,
      strict: true,
      strictType: 'string'
    },
    // email
    {
      key: 'email',
      label: '邮箱',
      type: 'isEmail',
      required: false,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'description',
      label: '描述',
      strict: true,
      strictType: 'string'
    }
  ]
  if (cover) {
    rule.push({
      key: 'cover',
      label: '封面',
      type: 'isMongoId'
    })
  }
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // 校验用户名是否重复
  try {
    const usernameRes = await userUtils.findOne({ username })
    if (usernameRes) {
      res.status(400).json({
        errors: [
          {
            message: '用户名已存在'
          }
        ]
      })
      return
    }
  } catch (error) {
    res.status(400).json({
      errors: [
        {
          message: '用户名校验失败'
        }
      ]
    })
    return
  }
  // 校验昵称是否重复
  try {
    const nickNameRes = await userUtils.findOne({ nickname })
    if (nickNameRes) {
      res.status(400).json({
        errors: [
          {
            message: '昵称已存在'
          }
        ]
      })
      return
    }
  } catch (error) {
    res.status(400).json({
      errors: [
        {
          message: '昵称校验失败'
        }
      ]
    })
    return
  }
  // 校验密码
  params['password'] = utils.creatBcryptStr(password)
  // 封面
  if (cover) {
    // cover必须是ObjectId
    if (!utils.isObjectId(cover)) {
      res.status(400).json({
        errors: [
          {
            message: '封面ID不正确'
          }
        ]
      })
      return
    }
  }

  // IP
  const IP = utils.getUserIp(req)
  params['IP'] = IP
  params['ipInfo'] = await utils.IP2LocationUtils(IP, null, null, false)

  // 生成ObjectId
  const newId = new mongoose.Types.ObjectId()
  params['_id'] = newId

  //照片上传
  //base64正则
  const base64Reg = /^data:image\/\w+;base64,/
  if (photo && base64Reg.test(photo)) {
    const path = './public/upload/avatar/'
    const fileName = newId
    try {
      const imgRes = utils.base64ToFile(photo, path, fileName, {
        createDir: true
      })
      params['photo'] = `/upload/avatar/${imgRes.fileNameAll}?v=${Date.now()}`
    } catch (error) {
      res.status(400).json({
        errors: [
          {
            message: '照片上传失败'
          }
        ]
      })
      throw new Error(error)
    }
  }

  // 写入数据库
  userUtils
    .save(params)
    .then(data => {
      adminApiLog.info(`admin:${req.admin.username} create user:${username} success,
  ,IP:${IP}`)
      res.send({})
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '用户创建失败'
          }
        ]
      })
      adminApiLog.error(`admin:${username} create fail, ${logErrorToText(err)}`)
    })
}
