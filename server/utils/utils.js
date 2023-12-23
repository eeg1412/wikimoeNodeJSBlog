const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const fs = require('fs')
const path = require('path');
const { IP2Location } = require("ip2location-nodejs");
const parser = require('ua-parser-js');

exports.creatSha256Str = function (str) {
  const sha256 = crypto.createHash('sha256')
  sha256.update(str)
  return sha256.digest('hex')
}
exports.HMACSHA256 = (str, secret) => {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(str)
  return hmac.digest('hex')
}
exports.creatBcryptStr = function (str) {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(str, salt)
  return hash
}
exports.checkBcryptStr = function (str, hash) {
  return bcrypt.compareSync(str, hash)
}

exports.creatJWT = function (payload, exp) {
  const secret = process.env.JWT_SECRET
  const token = jwt.sign(payload, secret, { expiresIn: exp })
  return token
}
exports.checkJWT = function (token) {
  const secret = process.env.JWT_SECRET
  let result = null
  try {
    const decoded = jwt.verify(token, secret)
    result = {
      isError: false,
      data: decoded,
    }
    return result
  } catch (err) {
    // {"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2022-03-03T02:36:11.000Z"}
    // {"name":"JsonWebTokenError","message":"invalid token"}
    result = {
      isError: true,
      errorData: { ...err },
    }
    return result
  }
}


exports.md5hex = (str /*: string */) => {
  const md5 = crypto.createHash('md5')
  return md5.update(str, 'utf8').digest('hex').toLowerCase()
}

exports.parseBase64 = (base64) => {
  if (!base64) {
    return null
  }
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (matches.length !== 3) {
    return null
  }
  return {
    type: matches[1],
    data: matches[2],
    extension: matches[1].split('/')[1] || 'jpg',
  }
}


exports.checkForm = function (form, ruleArr) {
  const requiredCheck = function (required, value) {
    return required && checkVauleIsNone(value)
  }
  const checkVauleIsNone = function (value) {
    return value === null || value === undefined || value === ''
  }
  const result = []
  ruleArr.forEach((rule) => {
    const { key, label, type, required, options, errorMessage, reg } = rule
    const value = form[key]
    if (requiredCheck(required, value)) {
      result.push({
        key,
        message: `${label || key} 是必须项`
      })
    }
    if (type && !checkVauleIsNone(value)) {
      if (type === 'regCheck') {
        if (!reg.test(value)) {
          result.push({
            key,
            message: errorMessage || `${label || key} 内容有误`
          })
        }
      } else {
        const check = validator[type](String(value), options)
        if (!check && check !== 0) {
          result.push({
            key,
            message: errorMessage || `${label || key} 内容有误`
          })
        }
      }

    }
  })
  return result
}

exports.getUserIp = function (req) {
  let ip = (req.headers['x-forwarded-for'] || '').split(',')[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }
  return ip;
};

// checkEnv
exports.checkEnv = function () {
  const envArr = [
    'DB_HOST',
    'JWT_SECRET',
  ]
  const result = []
  envArr.forEach((env) => {
    if (!process.env[env]) {
      result.push(env)
    }
  })
  // 如果有缺失的env直接关闭程序
  if (result.length > 0) {
    console.error('请在根目录下创建.env文件，并添加以下环境变量：', result.join(','))
    process.exit(1)
  }
}

// base64转图片文件
exports.base64ToFile = function (base64, destpath, fileName) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const dataBuffer = Buffer.from(base64Data, 'base64')
  // 文件名后缀
  const extension = base64.match(/data:image\/(\w+);base64,/)[1]
  const fileNameAll = `${fileName}.${extension}`
  const filepath = path.join(destpath, fileNameAll)
  fs.writeFileSync(filepath, dataBuffer)
  return {
    filepath,
    fileNameAll
  }
}

// 生成多层级的树状结构
exports.generateTreeData = function (data, parentKey = 'parent') {
  const treeData = []
  const map = {}
  data.forEach((item) => {
    map[item._id] = item
  })
  data.forEach((item) => {
    const parent = map[item[parentKey]]
    if (parent) {
      (parent.children || (parent.children = [])).push(item)
    } else {
      treeData.push(item)
    }
  })
  return treeData
}


exports.initIp2location = function () {
  const binFilePath = path.join('./utils/ip2location/', process.env.IP2LOCATION_FILE_NAME)
  if (!fs.existsSync(binFilePath)) {
    console.error(('ip2location文件不存在,如果需要IP解析请先从：https://lite.ip2location.com 下载BIN文件，然后放到utils/ip2location目录下'))
    return
  }
  ip2location = new IP2Location();
  ip2location.open(binFilePath);
}
let ip2location = null
if (process.env.IP2LOCATION === '1') {
  this.initIp2location()
}
exports.IP2LocationUtils = function (ip, id, modelUtils) {
  if (process.env.IP2LOCATION === '1') {
    const promise = new Promise((resolve, reject) => {
      console.time('ip2location')
      try {
        // 判断ip是否是ipv6
        const isIPV6 = ip.includes(':')
        // 如果是ipv6，ip2location只能解析ipv4，所以不对ipv6进行解析
        if (isIPV6) {
          console.log('ip2location不支持ipv6解析')
          resolve(null)
          return
        }
        // 判断ip是否是ipv4
        const ipV4Reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
        const isIPV4 = ipV4Reg.test(ip)
        // 如果不是ipv4，直接返回null
        if (!isIPV4) {
          console.log('不是ipv4，跳过ip解析')
          resolve(null)
          return
        }
        const ipInfoAll = ip2location.getAll(String(ip).trim());
        // 遍历ipInfoAll，如果包含字符串This method is 就删除该属性
        Object.keys(ipInfoAll).forEach((key) => {
          if (ipInfoAll[key].includes('This method is not')) {
            delete ipInfoAll[key]
          }
        })

        console.timeEnd('ip2location')
        modelUtils.updateOne({ _id: id }, {
          ipInfo: ipInfoAll
        })
        resolve(ipInfoAll)
      } catch (err) {
        console.error('ip2location解析失败', err)
        reject(err)
      }
    })
    return promise
  }
  console.log('ip2location未开启,跳过ip解析')
  return new Promise((resolve) => {
    resolve(null)
  })

}
exports.deviceUtils = function (req, id, modelUtils) {
  const ua = parser(req.get('user-agent'))
  const result = modelUtils.updateOne({ _id: id }, {
    deviceInfo: ua
  })
  return result
}
// isNumber
exports.isNumber = function (value) {
  return typeof value === 'number' && isFinite(value)
}

exports.isObjectId = function (value) {
  return value.match(/^[0-9a-fA-F]{24}$/)
}