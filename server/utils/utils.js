const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path');
const { IP2Location } = require("ip2location-nodejs");
const parser = require('ua-parser-js');
const nodemailer = require('nodemailer')
const emailSendHistoryUtils = require('../mongodb/utils/emailSendHistorys')
const postUtils = require('../mongodb/utils/posts')
const commentUtils = require('../mongodb/utils/comments')
const referrerUtils = require('../mongodb/utils/referrers')
const AsyncLock = require('async-lock');
const lock = new AsyncLock({ timeout: 60000 });
const crawlerUserAgents = require('./crawler-user-agents.json')
const { Worker } = require('worker_threads');

const botUserAgentList = []
crawlerUserAgents.forEach((item) => {
  const obj = {
    pattern: new RegExp(item.pattern),
    name: item.pattern.replace(/[^\w]/gi, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
  }
  botUserAgentList.push(obj)
})

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
exports.generateJwtSecret = function (byteLength = 256) {
  try {
    // 生成随机字节
    const randomBytes = crypto.randomBytes(byteLength);
    // 转换为 base64 字符串
    const jwtSecret = randomBytes.toString('base64');

    return jwtSecret;
  } catch (error) {
    console.error('生成 JWT SECRET 失败:', error);
    throw error;
  }
}
exports.ensureJWTSecretAdmin = function (reflush = false) {
  const secretDir = path.join('./secret')
  const keyPath = path.join(secretDir, 'JWTSecretAdmin.key')

  try {
    // 确保secret目录存在
    fsExtra.ensureDirSync(secretDir)

    // 检查密钥文件是否存在
    const exists = fsExtra.pathExistsSync(keyPath)

    if (!exists || reflush) {
      console.info('将生成新的JWT密钥')
      // 生成新的JWT密钥
      const jwtSecret = this.generateJwtSecret()
      // 写入文件
      fsExtra.writeFileSync(keyPath, jwtSecret, 'utf8')
      console.info('成功生成新的JWT-Admin密钥')
    }

    // 读取密钥
    const secret = fsExtra.readFileSync(keyPath, 'utf8')
    return secret

  } catch (error) {
    console.error('JWT密钥文件操作失败:', error)
    throw error
  }
}
exports.ensureJWTSecretBlog = function (reflush = false) {
  const secretDir = path.join('./secret')
  const keyPath = path.join(secretDir, 'JWTSecretBlog.key')

  try {
    // 确保secret目录存在
    fsExtra.ensureDirSync(secretDir)

    // 检查密钥文件是否存在
    const exists = fsExtra.pathExistsSync(keyPath)

    if (!exists || reflush) {
      console.info('将生成新的JWT密钥')
      // 生成新的JWT密钥
      const jwtSecret = this.generateJwtSecret()
      // 写入文件
      fsExtra.writeFileSync(keyPath, jwtSecret, 'utf8')
      console.info('成功生成新的JWT-Blog密钥')
    }

    // 读取密钥
    const secret = fsExtra.readFileSync(keyPath, 'utf8')
    return secret

  } catch (error) {
    console.error('JWT密钥文件操作失败:', error)
    throw error
  }
}
exports.limitStr = (str, len) => {
  const strArray = Array.from(str)
  if (strArray.length > len) {
    return strArray.slice(0, len).join('') + '...'
  }
  return str
}

exports.creatJWT = function (payload, exp) {
  const secret = global.$secret.JWTSecretAdmin
  if (!secret) {
    throw new Error('JWT密钥不存在')
  }
  const token = jwt.sign(payload, secret, { expiresIn: exp })
  return token
}
exports.creatJWTBlog = function (payload, exp) {
  const secret = global.$secret.JWTSecretBlog
  if (!secret) {
    throw new Error('JWT密钥不存在')
  }
  const token = jwt.sign(payload, secret, { expiresIn: exp })
  return token
}
exports.checkJWT = function (token) {
  const secret = global.$secret.JWTSecretAdmin
  if (!secret) {
    throw new Error('JWT密钥不存在')
  }
  // console.time('checkJWT')
  let result = null
  try {
    const decoded = jwt.verify(token, secret)
    result = {
      isError: false,
      data: decoded,
    }
    // console.timeEnd('checkJWT')
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
exports.checkJWTBlog = function (token) {
  const secret = global.$secret.JWTSecretBlog
  if (!secret) {
    throw new Error('JWT密钥不存在')
  }
  // console.time('checkJWT')
  let result = null
  try {
    const decoded = jwt.verify(token, secret)
    result = {
      isError: false,
      data: decoded,
    }
    // console.timeEnd('checkJWT')
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


const md5hex = (str /*: string */) => {
  const md5 = crypto.createHash('md5')
  return md5.update(str, 'utf8').digest('hex').toLowerCase()
}

exports.md5hex = md5hex

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
  if (ip.slice(0, 7).toLowerCase() === "::ffff:") {
    ip = ip.slice(7);
  }
  return ip;
};

// checkEnv
exports.checkEnv = function () {
  const envArr = [
    'DB_HOST'
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
exports.base64ToFile = function (base64, destpath, fileName, options = {}) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const dataBuffer = Buffer.from(base64Data, 'base64')
  // 文件名后缀
  const extension = base64.match(/data:image\/(\w+);base64,/)[1]
  const fileNameAll = `${fileName}.${extension}`
  if (options.createDir) {
    // 判断文件夹是否存在，不存在则创建
    const destpathToPath = path.join(destpath)
    if (!fs.existsSync(destpathToPath)) {
      fs.mkdirSync(destpathToPath, { recursive: true });
    }
  }

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
  const binFilePath = path.join('./utils/ip2location/', process.env.IP2LOCATION_FILE_NAME || 'IP2LOCATION.BIN')
  if (!fs.existsSync(binFilePath)) {
    console.warn(('ip2location文件不存在,如果需要IP解析请先从：https://lite.ip2location.com 下载BIN文件，然后放到utils/ip2location目录下'))
    return
  }
  ip2location = new IP2Location();
  ip2location.open(binFilePath);
  console.info('ip2location初始化成功')
}
let ip2location = null
this.initIp2location()

exports.IP2LocationUtils = function (ip, id, modelUtils, updateMongodb = true) {
  if (ip2location) {
    const promise = new Promise((resolve, reject) => {
      console.time('ip2location')
      try {
        // 判断ip是否是ipv6
        const isIPV6 = ip.includes(':')
        // 判断ip是否是ipv4
        const ipV4Reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
        const isIPV4 = ipV4Reg.test(ip)
        // 如果不是ipv4，直接返回null
        if (!isIPV4 && !isIPV6) {
          console.log('ip不是ipv4或ipv6,跳过ip解析')
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
        if (updateMongodb) {
          modelUtils.updateOne({ _id: id }, {
            ipInfo: ipInfoAll
          })
        }
        resolve(ipInfoAll)
      } catch (err) {
        console.error('ip2location解析失败', err)
        reject(err)
      }
    })
    return promise
  }
  return new Promise((resolve) => {
    resolve(null)
  })

}
exports.deviceUAInfoUtils = function (req) {
  const ua = req.get('user-agent')
  if (ua.length > 1000) {
    return null
  }
  const uaParser = parser(ua)
  return uaParser
}
exports.deviceUtils = function (req, id, modelUtils) {
  const ua = this.deviceUAInfoUtils(req)
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
  const str = String(value);
  return /^[0-9a-fA-F]{24}$/.test(str);
}
// isUUID
exports.isUUID = function (value, version = 4) {
  // 通过 validator isUUID 来判断
  return validator.isUUID(String(value), version)
}
// getTodayStartTime
exports.getTodayStartTime = function () {
  const date = new Date()
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  return date
}
// getTodayEndTime
exports.getTodayEndTime = function () {
  const date = new Date()
  date.setHours(23)
  date.setMinutes(59)
  date.setSeconds(59)
  return date
}

// 写一个用nodemailer发送邮件的方法，参数是收件人邮箱和邮件内容和标题
exports.sendEmail = function (to, content, subject) {
  const emailSettings = global.$globalConfig.emailSettings
  const siteSettings = global.$globalConfig.siteSettings
  const { siteTitle } = siteSettings
  if (!emailSettings) {
    console.error('请在后台设置邮箱')
    return
  }
  const { emailSmtpHost, emailSmtpPort, emailSmtpSecure, emailSender, emailPassword } = emailSettings
  // 以上参数缺一不可
  if (!emailSmtpHost || !emailSmtpPort || !emailSender || !emailPassword) {
    console.error('请在后台设置邮箱')
    return
  }
  // emailSender 和 to 不能相同
  if (emailSender === to) {
    console.error('emailSender 和 to 不能相同')
    return
  }
  const transporter = nodemailer.createTransport({
    host: emailSmtpHost,
    port: emailSmtpPort,
    secure: emailSmtpSecure || false, // true for 465, false for other ports
    auth: {
      user: emailSender,
      pass: emailPassword
    }
  })
  const mailOptions = {
    from: emailSender,
    to,
    subject,
    html: content
  }
  const promise = new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error)
        reject(error)
        return
      }
      console.info('Message sent: %s', info.messageId)
      resolve(info)
    })
  })
  promise.then((info) => {
    const emailSendHistory = {
      to,
      subject,
      content,
      status: 1
    }
    emailSendHistoryUtils.save(emailSendHistory)
  }).catch((err) => {
    let errInfo = ''
    const errorType = typeof err
    if (errorType === 'string') {
      errInfo = err
    }
    if (errorType === 'object') {
      errInfo = JSON.stringify(err)
      if (err instanceof Error && errInfo === '{}') {
        errInfo = err.message
      }
    }
    const emailSendHistory = {
      to,
      content,
      subject,
      status: 0,
      errInfo: errInfo
    }
    emailSendHistoryUtils.save(emailSendHistory)
  })
  return promise
}
// 发送评论添加通知，参数是文章信息post，评论信息comment
exports.sendCommentAddNotice = function (post, comment) {
  const siteSettings = global.$globalConfig.siteSettings
  const emailSettings = global.$globalConfig.emailSettings
  const { emailSendToMeTemplate, emailEnable, emailSendOptions, emailReceiver } = emailSettings

  // 如果没有设置emailSendToMeTemplate，就不发送邮件
  if (!emailSendToMeTemplate) {
    console.error('请在后台设置emailSendToMeTemplate')
    return
  }

  // 判断emailEnable为true，且emailSendOptions包含字符串receiveComment
  if (emailEnable && emailSendOptions.includes('receiveComment')) {
    const { siteUrl, siteTitle } = siteSettings
    const { title, excerpt } = post
    let linkTitle = title || excerpt
    if (linkTitle.length > 200) {
      linkTitle = this.limitStr(linkTitle, 200)
    }
    let { nickname, content, user } = comment
    content = this.escapeHtml(content)
    if (user) {
      nickname = user.nickname
    }
    nickname = this.escapeHtml(nickname)
    const to = emailReceiver
    const subject = `【${siteTitle}】的文章/推文有了新的评论`
    let contentHtml = emailSendToMeTemplate
    // 替换模板中的变量
    // ${comment}为评论内容
    // ${nickname}为评论者昵称
    // ${title}为文章标题
    // 其中${title}需要替换成a标签
    // 其中${siteTitle}为站点名称需要替换成a标签
    // 开始替换
    contentHtml = contentHtml.replace(/\${comment}/g, content)
    contentHtml = contentHtml.replace(/\${nickname}/g, nickname)
    contentHtml = contentHtml.replace(/\${title}/g, `<a href="${this.getPostPagePath(post)}" target="_blank">${linkTitle}</a>`)
    contentHtml = contentHtml.replace(/\${siteTitle}/g, `<a href="${siteUrl}" target="_blank">${siteTitle}</a>`)
    this.sendEmail(to, contentHtml, subject)
  }

}
// 评论撤回通知，参数是文章信息post，评论信息comment
exports.sendRetractCommentNotice = function (post, comment) {
  const siteSettings = global.$globalConfig.siteSettings
  const emailSettings = global.$globalConfig.emailSettings
  const { emailRetractCommentTemplate, emailEnable, emailSendOptions, emailReceiver } = emailSettings

  // 如果没有设置emailRetractCommentTemplate，就不发送邮件
  if (!emailRetractCommentTemplate) {
    console.error('请在后台设置emailRetractCommentTemplate')
    return
  }

  // 判断emailEnable为true，且emailSendOptions包含字符串retractComment
  if (emailEnable && emailSendOptions.includes('retractComment')) {
    const { siteUrl, siteTitle } = siteSettings
    const { title, excerpt } = post
    let linkTitle = title || excerpt
    if (linkTitle.length > 200) {
      linkTitle = this.limitStr(linkTitle, 200)
    }
    let { nickname, content, user } = comment
    content = this.escapeHtml(content)
    if (user) {
      nickname = user.nickname
    }
    nickname = this.escapeHtml(nickname)
    const to = emailReceiver
    const subject = `【${siteTitle}】的评论被评论者撤回`
    let contentHtml = emailRetractCommentTemplate
    // 替换模板中的变量
    contentHtml = contentHtml.replace(/\${comment}/g, `${content}`)
    contentHtml = contentHtml.replace(/\${nickname}/g, nickname)
    contentHtml = contentHtml.replace(/\${title}/g, `<a href="${this.getPostPagePath(post)}" target="_blank">${linkTitle}</a>`)
    contentHtml = contentHtml.replace(/\${siteTitle}/g, `<a href="${siteUrl}" target="_blank">${siteTitle}</a>`)
    this.sendEmail(to, contentHtml, subject)
  }
}

// 发送回复评论通知，参数是文章信息post，评论信息comment，父级评论信息parentComment
exports.sendReplyCommentNotice = async function (post, comment) {
  if (typeof comment === 'string') {
    // 如果comment是字符串，说明是评论id，需要查询评论信息
    comment = await commentUtils.findOne({ _id: comment }, '', { userFilter: 'nickname _id email' })
  }
  if (!comment) {
    console.error('comment为必须参数')
    return
  }

  // 如果不存在post就查询post
  if (!post) {
    post = await postUtils.findOne({ _id: comment.post })
    if (!post) {
      console.error('post不存在')
      return
    }
  }


  let parentComment = await commentUtils.findOne({ _id: comment.parent }, '', { userFilter: 'nickname _id email' })
  if (!parentComment) {
    console.error('parentComment不存在')
    return
  }

  const parentCommentUser = parentComment.user || {}
  const commentUser = comment.user || {}
  const parentCommentIsAdmin = parentComment.user ? true : false
  const commentIsAdmin = comment.user ? true : false

  const parentCommentEmail = parentComment.email || parentCommentUser.email
  const commentEmail = comment.email || commentUser.email

  if (!parentCommentEmail) {
    console.log('parentComment.email不存在')
    return
  }
  if (parentCommentEmail === commentEmail) {
    console.log('父级评论者邮箱和评论者邮箱相同，不发送邮件')
    return
  }
  if (parentCommentIsAdmin) {
    console.log('父级评论者是管理员，不发送邮件')
    return
  }
  if (parentComment.status !== 1) {
    console.log('父级评论未审核通过，不发送邮件')
    return
  }
  const siteSettings = global.$globalConfig.siteSettings
  const emailSettings = global.$globalConfig.emailSettings
  const { emailSendToCommenterTemplate, emailEnable, emailSendOptions } = emailSettings

  // 如果没有设置emailSendToCommenterTemplate，就不发送邮件
  if (!emailSendToCommenterTemplate) {
    console.error('请在后台设置emailSendToCommenterTemplate')
    return
  }

  // 判断emailEnable为true，且emailSendOptions包含字符串receiveComment
  if (emailEnable && emailSendOptions.includes('replyComment')) {
    const { siteUrl, siteTitle } = siteSettings
    const { title, excerpt } = post
    let linkTitle = title || excerpt
    if (linkTitle.length > 200) {
      linkTitle = this.limitStr(linkTitle, 200)
    }
    let { nickname, content } = comment
    content = this.escapeHtml(content)
    let { nickname: parentNickname, content: parentContent } = parentComment
    parentContent = this.escapeHtml(parentContent)
    if (commentIsAdmin) {
      nickname = commentUser.nickname
    }
    nickname = this.escapeHtml(nickname)
    if (parentCommentIsAdmin) {
      parentNickname = parentCommentUser.nickname
    }
    parentNickname = this.escapeHtml(parentNickname)
    const to = parentCommentEmail
    const subject = `您在【${siteTitle}】发表的评论收到了回复`
    let contentHtml = emailSendToCommenterTemplate
    // 替换模板中的变量
    // ${comment}为评论内容
    // ${nickname}为评论者昵称
    // ${title}为文章标题
    // ${parentComment}为父级评论内容
    // ${parentNickname}为父级评论者昵称
    // 其中${title}需要替换成a标签
    // 其中${siteTitle}为站点名称需要替换成a标签
    // 开始替换
    contentHtml = contentHtml.replace(/\${comment}/g, content)
    contentHtml = contentHtml.replace(/\${nickname}/g, nickname)
    contentHtml = contentHtml.replace(/\${title}/g, `<a href="${this.getPostPagePath(post)}/#comment-${comment._id}" target="_blank">${linkTitle}</a>`)
    contentHtml = contentHtml.replace(/\${siteTitle}/g, `<a href="${siteUrl}" target="_blank">${siteTitle}</a>`)
    contentHtml = contentHtml.replace(/\${parentComment}/g, parentContent)
    contentHtml = contentHtml.replace(/\${parentNickname}/g, parentNickname)
    this.sendEmail(to, contentHtml, subject)
  }
}

exports.getPostPagePath = (postData) => {
  // 先判断type是1，2还是3，1和2跳转到/post/id，3跳转到/page/id
  // 如果有别名，就跳转到别名，没有别名就跳转到id
  const siteSettings = global.$globalConfig.siteSettings
  const { siteUrl } = siteSettings
  if (!siteUrl) {
    throw new Error('siteUrl不存在,请在后台设置')
  }
  let path
  if (postData.type === 1 || postData.type === 2) {
    path = '/post/'
  } else if (postData.type === 3) {
    path = '/page/'
  } else {
    throw new Error('type类型错误')
  }

  if (postData.alias) {
    path += postData.alias
  } else {
    path += postData._id
  }
  return siteUrl + path
}

const referrerRecordTimerMap = {}
// 引用记录传入参数是referrer和type
exports.referrerRecord = function (referrer, referrerType) {
  // const siteUrl = global.$globalConfig?.siteSettings?.siteUrl
  // if (!siteUrl) {
  //   console.warn('siteUrl不存在,请在后台设置')
  //   return
  // }
  // if (referrerDomainWhitelist.length === 0) {
  //   console.warn('引用白名单为空，不记录referrer')
  //   return
  // }
  if (referrer) {
    // 获取otherSettings siteReferrerWhiteList
    const referrerDomainWhitelist = global.$globalConfig?.otherSettings?.siteReferrerWhiteList || []
    const isReady = global.$isReady
    if (!isReady) {
      console.warn('未完全启动，不记录referrer')
      return
    }
    // 如果referrer包含siteUrl，就不记录
    // if (referrer.includes(siteUrl)) {
    //   return
    // }
    // referrer最大长度为300
    if (referrer.length > 300) {
      referrer = referrer.substring(0, 300)
    }
    // 如果referrer存在，就判断referrer是否在referrerDomainWhitelist中
    const isReferrerDomainWhitelist = referrerDomainWhitelist.some((item) => {
      // list中仅包含域名，不包含协议和路径
      return referrer.includes(item)
    })
    // 如果referrer不在REFERRER_DOMAIN_WHITELIST中，就记录
    if (!isReferrerDomainWhitelist) {
      const md5Id = md5hex(`${referrerType}:${referrer}`)
      // 判断是否存在计时器
      if (referrerRecordTimerMap[md5Id]) {
        // 如果存在计时器，就不操作
        return
      }
      // 设置计时器
      referrerRecordTimerMap[md5Id] = setTimeout(() => {
        // 如果计时器到期，就保存referrer
        const params = {
          referrer,
          referrerType
        }
        console.log('referrer记录', params)
        referrerUtils.save(params)
        // 删除计时器
        delete referrerRecordTimerMap[md5Id]
      }, 1000 * 60 * 60)
    }
  }

}

exports.escapeSpecialChars = function (keyword) {
  // 匹配正则表达式中的特殊字符
  return keyword.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}
// 转义html
exports.escapeHtml = function (unsafe) {
  if (!unsafe) {
    return ''
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\$/g, '&#36;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;')
}

// get referrer 参数是req
exports.setReferrer = function (referrer) {
  if (referrer) {
    if (referrer.length > 300) {
      referrer = referrer.substring(0, 300)
    }
    return referrer
  }

  return null
}
// 检查是否是bot
exports.isSearchEngine = function (req) {
  const ua = req.get('user-agent')
  const res = {
    isBot: false,
    botName: '',
  };
  if (!ua) {
    res.isBot = true;
    res.botName = 'unknown-no-ua';
  } else if (ua.length > 1000) {
    res.isBot = true;
    res.botName = 'unknown-ua-too-long';
  } else {
    botUserAgentList.some((item) => {
      if (item.pattern.test(ua)) {
        res.isBot = true;
        res.botName = item.name;
        return true;
      }
      return false;
    });
  }

  return res;
}

exports.imageCompress = async (toExtname, fileData, animated = false, newWidth, newHeight, imgSettingCompressQuality, filePath) => {
  const shrpWorker = new Worker('./utils/workers/sharpWorker.js')
  const promise = new Promise((resolve, reject) => {
    shrpWorker.on('message', (data) => {
      if (data.status === 'success') {
        resolve(data.data)
      } else {
        reject(data)
      }
    })
    shrpWorker.on('error', (err) => {
      reject(err)
    })
    shrpWorker.postMessage({
      action: 'imageCompress',
      data: [toExtname, fileData, animated, newWidth, newHeight, imgSettingCompressQuality, filePath]
    })
  })
  return promise
}

exports.imageMetadata = async (fileData) => {
  const shrpWorker = new Worker('./utils/workers/sharpWorker.js')
  const promise = new Promise((resolve, reject) => {
    shrpWorker.on('message', (data) => {
      if (data.status === 'success') {
        resolve(data.data)
      } else {
        reject(data)
      }
    })
    shrpWorker.on('error', (err) => {
      reject(err)
    })
    shrpWorker.postMessage({
      action: 'imageMetadata',
      data: [fileData]
    })
  })
  return promise
}

exports.logErrorToText = (error) => {
  const errorType = typeof error
  if (errorType === 'string') {
    return error
  }
  if (errorType === 'object') {
    if (error instanceof Error) {
      return error.message
    }
    return JSON.stringify(error)
  }
}
global.logErrorToText = this.logErrorToText

exports.handleRangeRequest = (req, res, next, folder) => {
  const range = req.headers.range;
  const unsafePath = path.join(folder, req.path);
  const safePath = path.resolve(path.normalize(unsafePath));
  if (!safePath.startsWith(path.resolve(folder))) {
    return res.status(400).send('Invalid path');
  }

  if (!range) {
    next();
    return;
  }

  if (!fs.existsSync(safePath)) {
    next();
    return
  }
  const stat = fs.statSync(safePath);
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

  if (start >= stat.size) {
    res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + stat.size);
    return;
  }

  const chunksize = (end - start) + 1;
  const file = fs.createReadStream(safePath, { start, end });
  const head = {
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'video/mp4',
  };

  res.writeHead(206, head);
  file.pipe(res);
  res.on('close', () => {
    file.destroy();
  });
}

// async-lock
exports.executeInLock = (key, fn) => {
  return lock.acquire(key, () => {
    return fn()
  })
}

exports.getReaderlogsSize = async () => {
  const mongodb = global.$mongodDB
  const db = mongodb.db.collection('readerlogs')
  const stats = await db.stats()
  const size = stats.size
  // 从环境变量获取最大大小,默认1GB
  const maxReaderlogsSize = process.env.MAX_HISTORYLOGS_SIZE ? Number(process.env.MAX_HISTORYLOGS_SIZE) : 1073741824
  // 是否超过最大大小
  const isExceedMaxSize = size > maxReaderlogsSize
  return {
    size,
    maxReaderlogsSize,
    isExceedMaxSize,
  }
}

// postLikeLogs
exports.getPostLikeLogsSize = async () => {
  const mongodb = global.$mongodDB
  const db = mongodb.db.collection('postlikelogs')
  const stats = await db.stats()
  const size = stats.size
  // 从环境变量获取最大大小,默认1GB
  const maxPostLikeLogsSize = process.env.MAX_HISTORYLOGS_SIZE ? Number(process.env.MAX_HISTORYLOGS_SIZE) : 1073741824
  // 是否超过最大大小
  const isExceedMaxSize = size > maxPostLikeLogsSize
  return {
    size,
    maxPostLikeLogsSize,
    isExceedMaxSize,
  }
}

// commentLikeLogs
exports.getCommentLikeLogsSize = async () => {
  const mongodb = global.$mongodDB
  const db = mongodb.db.collection('commentlikelogs')
  const stats = await db.stats()
  const size = stats.size
  // 从环境变量获取最大大小,默认1GB
  const maxCommentLikeLogsSize = process.env.MAX_HISTORYLOGS_SIZE ? Number(process.env.MAX_HISTORYLOGS_SIZE) : 1073741824
  // 是否超过最大大小
  const isExceedMaxSize = size > maxCommentLikeLogsSize
  return {
    size,
    maxCommentLikeLogsSize,
    isExceedMaxSize,
  }
}

// 文字中的空格和全角空格替换为下划线
exports.replaceSpacesWithUnderscores = (str) => {
  return str.replace(/[\s\u3000]/g, '-');
}

// let reflushBlogCacheTimer = null
// exports.reflushBlogCache = async () => {
//   if (reflushBlogCacheTimer) {
//     return
//   }
//   reflushBlogCacheTimer = setTimeout(async () => {
//     console.info('刷新blogCache')
//     blogCachesUtils.deleteMany({}).then(() => {
//       console.info('blogCache刷新成功')
//     })
//     reflushBlogCacheTimer = null
//   }, 1000 * 2)
// }