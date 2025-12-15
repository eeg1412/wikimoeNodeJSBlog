const userUtils = require('../../mongodb/utils/users')
const userLoginLogsUtils = require('../../mongodb/utils/userLoginLogs')
const utils = require('../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

const saveLoginLogs = async function (
  username,
  ip,
  ipInfo,
  deviceInfo,
  success,
  msg
) {
  // 写入登录日志
  await userLoginLogsUtils.save({
    username,
    ip,
    ipInfo,
    deviceInfo,
    success,
    msg
  })
}
module.exports = async function (req, res, next) {
  utils
    .executeInLock('adminLogin', async () => {
      const username = req.body.username
      const password = req.body.password
      // 是否记住密码
      const remember = req.body.remember
      // IP
      const IP = utils.getUserIp(req)
      // 校验格式
      const params = {
        username: username,
        password: password,
        remember: remember
      }
      const rule = [
        {
          key: 'username',
          label: '用户名',
          required: true,
          strict: true,
          strictType: 'string'
        },
        {
          key: 'password',
          label: '密码',
          required: true,
          strict: true,
          strictType: 'string'
        },
        {
          key: 'remember',
          label: '记住密码',
          strict: true,
          strictType: 'boolean'
        }
      ]
      const errors = utils.checkForm(params, rule)
      if (errors.length > 0) {
        res.status(400).json({ errors })
        return
      }

      const limitedUsername = utils.limitStr(username, 50)

      const siteAdminLoginAttemptTime =
        global.$globalConfig?.otherSettings?.siteAdminLoginAttemptTime || 5
      const siteAdminLoginMaxAttempts =
        global.$globalConfig?.otherSettings?.siteAdminLoginMaxAttempts || 3

      // 检查登录尝试次数
      const timeThreshold = new Date(
        Date.now() - siteAdminLoginAttemptTime * 60 * 1000
      )
      const recentAttempts = await userLoginLogsUtils.countDocuments({
        ip: IP,
        success: false,
        date: { $gte: timeThreshold }
      })

      if (recentAttempts >= siteAdminLoginMaxAttempts) {
        res.status(400).json({
          errors: [
            {
              message: `登录失败次数过多，请稍后再试`
            }
          ]
        })
        adminApiLog.warn(
          `admin:${limitedUsername} from IP:${IP} try login but too many attempts`
        )
        return
      }

      const ipInfo = await utils.IP2LocationUtils(IP, null, null, false)
      const deviceInfo = utils.deviceUAInfoUtils(req)
      // 校验用户名密码
      const admin = await userUtils.findOne({ username })
      if (!admin) {
        adminApiLog.warn(
          `admin:${limitedUsername} try login but not found account`
        )
        res.status(400).json({
          errors: [
            {
              message: '用户名或密码不正确'
            }
          ]
        })
        await saveLoginLogs(
          limitedUsername,
          IP,
          ipInfo,
          deviceInfo,
          false,
          '用户不存在'
        )
        return
      }
      if (!utils.checkBcryptStr(password, admin.password)) {
        adminApiLog.warn(`admin:${limitedUsername} password is not correct`)
        res.status(400).json({
          errors: [
            {
              message: '用户名或密码不正确'
            }
          ]
        })
        await saveLoginLogs(
          limitedUsername,
          IP,
          ipInfo,
          deviceInfo,
          false,
          '密码错误'
        )
        return
      }
      // 校验管理员disabled是否为true
      if (admin.disabled) {
        adminApiLog.warn(`admin:${limitedUsername} is disabled`)
        res.status(400).json({
          errors: [
            {
              message: '该账号已被禁用'
            }
          ]
        })
        await saveLoginLogs(
          limitedUsername,
          IP,
          ipInfo,
          deviceInfo,
          false,
          '账号被禁用'
        )
        return
      }
      // 校验通过写入IP
      const updateRes = await userUtils.updateOne(
        { _id: admin._id, __v: admin.__v },
        { IP, ipInfo }
      )
      if (updateRes?.modifiedCount === 0) {
        return res.status(400).json({ errors: [{ message: '登录发生错误' }] })
      } else {
        // 登录成功
        const jwt = utils.creatJWT(
          {
            id: admin._id,
            username: admin.username,
            pwversion: admin.pwversion,
            version: 1
          },
          remember ? '365d' : '1h'
        )
        adminApiLog.info(`admin:${username} login,IP:${IP}`)
        res.send({
          token: jwt
        })
        await saveLoginLogs(username, IP, ipInfo, deviceInfo, true, '登录成功')
      }
    })
    .then(() => {
      console.info('adminLogin unlock')
    })
    .catch(err => {
      userApiLog.error(`adminLogin unlock error, ${logErrorToText(err)}`)
    })
}
