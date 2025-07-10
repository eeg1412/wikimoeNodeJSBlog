const userUtils = require('../../../mongodb/utils/users')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  const {
    nickname,
    photo,
    email,
    description,
    disabled,
    password,
    cover,
    id,
    __v,
  } = req.body
  // 判断id是否符合mongodb的id规则
  if (!utils.isObjectId(id)) {
    res.status(400).json({
      errors: [
        {
          message: 'id不正确',
        },
      ],
    })
    return
  }
  const adminId = req.admin.id
  // 管理员不能修改自己
  if (id === adminId) {
    res.status(400).json({
      errors: [
        {
          message: '不能修改自己',
        },
      ],
    })
    return
  }
  // disabled必须为布尔值
  if (disabled !== undefined && typeof disabled !== 'boolean') {
    res.status(400).json({
      errors: [
        {
          message: 'disabled不正确',
        },
      ],
    })
    return
  }
  // 查询用户
  const userRes = await userUtils.findOne({ _id: id })
  if (!userRes) {
    res.status(400).json({
      errors: [
        {
          message: '管理员不存在',
        },
      ],
    })
    return
  }

  // 更新
  const updateData = {
    email,
    description,
    cover,
    disabled,
  }
  if (nickname && nickname !== userRes.nickname) {
    // 校验昵称是否重复
    const nickNameRes = await userUtils.findOne({ nickname })
    if (nickNameRes) {
      res.status(400).json({
        errors: [
          {
            message: '昵称已存在',
          },
        ],
      })
      return
    }
    updateData['nickname'] = nickname
  }
  // 校验密码
  if (password) {
    // 密码必须4位以上且包含大小写、数字和符号
    const passwordReg =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/
    if (!passwordReg.test(password)) {
      // 密码必须4位以上且包含大小写、数字和符号
      res.status(400).json({
        errors: [
          {
            message: '密码必须4位以上且包含大小写、数字和符号',
          },
        ],
      })
      return
    }
    // 校验通过
    updateData['password'] = utils.creatBcryptStr(password)
    // pwversion + 1
    updateData['pwversion'] = userRes.pwversion + 1
  }
  // 封面
  if (cover) {
    // cover必须是ObjectId
    if (!utils.isObjectId(cover)) {
      res.status(400).json({
        errors: [
          {
            message: '封面ID不正确',
          },
        ],
      })
      return
    }
  }

  // IP
  const IP = utils.getUserIp(req)
  updateData['IP'] = IP
  updateData['ipInfo'] = await utils.IP2LocationUtils(IP, null, null, false)

  //照片上传
  //base64正则
  const base64Reg = /^data:image\/\w+;base64,/
  if (photo && base64Reg.test(photo)) {
    const path = './public/upload/avatar/'
    const fileName = userRes._id
    try {
      const imgRes = utils.base64ToFile(photo, path, fileName, {
        createDir: true,
      })
      updateData['photo'] =
        `/upload/avatar/${imgRes.fileNameAll}?v=${Date.now()}`
    } catch (error) {
      res.status(400).json({
        errors: [
          {
            message: '照片上传失败',
          },
        ],
      })
      throw new Error(error)
    }
  }

  // 更新数据库
  const updateRes = await userUtils.updateOne({ _id: id, __v }, updateData)
  if (updateRes.modifiedCount === 0) {
    res.status(400).json({
      errors: [
        {
          message: '更新失败',
        },
      ],
    })
    return
  }
  adminApiLog.info(
    `admin:${userRes.nickname} - ${userRes._id} update profile,IP:${IP}`,
  )
  res.send({})
  // 更新缓存
  cacheDataUtils.getCommentList()
  // utils.reflushBlogCache()
}
