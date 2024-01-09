const fs = require('fs');
var path = require('path');
const optionUtils = require('../mongodb/utils/options')
const { Mint } = require('mint-filter')


const initGlobalConfig = async () => {
  // 默认配置
  const imgSettingConfig = {
    // 开启图片压缩
    imgSettingEnableImgCompress: false,
    // 图片压缩为webp格式
    imgSettingEnableImgCompressWebp: false,
    // 图片压缩质量
    imgSettingCompressQuality: 80,
    // 图片压缩最长边
    imgSettingCompressMaxSize: 1920,
    // 开启图片缩略图
    imgSettingEnableImgThumbnail: false,
    // 缩略图质量
    imgSettingThumbnailQuality: 40,
    // 图片缩略图最长边
    imgSettingThumbnailMaxSize: 680,
  }

  const siteSettingsConfig = {
    // 站点标题
    siteTitle: '',
    // 站点副标题
    siteSubTitle: '',
    // 站点LOGO
    siteLogo: '',
    // 站点封面
    siteDefaultCover: '',
    // 站点Favicon
    siteFavicon: '',
    // 站点描述
    siteDescription: '',
    // 站点关键词
    siteKeywords: '',
    // 站点地址
    siteUrl: '',
    // 每页显示
    sitePageSize: 10,
    // 你所在时区
    siteTimeZone: '',
  }
  const commentSettingsConfig = {
    // 开启评论
    siteEnableComment: false,
    // 发表评论间隔
    siteCommentInterval: 10,
    // 开启评论审核
    siteEnableCommentReview: false,
    // 评论分页
    siteCommentPageSize: 10,
  }

  const rssSettingsConfig = {
    // 开启RSS
    siteEnableRss: false,
    // RSS显示条数
    siteRssMaxCount: 10,
    // RSS输出全文
    // siteRssFullText: false,
  }

  const emailSettingsConfig = {
    // 开启邮件通知
    emailEnable: false,
    // smtp服务器
    emailSmtpHost: '',
    // smtp端口
    emailSmtpPort: '',
    // 发信邮箱
    emailSender: '',
    // 发信密码
    emailPassword: '',
    // 收信邮箱
    emailReceiver: '',
    // 发送选项
    // 收到评论时通知自己,回复评论时通知评论者
    emailSendOptions: [],
    // 通知自己模板
    emailSendToMeTemplate: '',
    // 通知评论者模板
    emailSendToCommenterTemplate: '',
  }
  // 其他配置
  const otherSettingsConfig = {
    // 引用白名单
    siteReferrerWhiteList: [],
    // 禁止评论关键词
    siteBannedKeywordList: [],
  }


  // 写一个函数，先判断原始类型，再将字符串转换为对应的类型
  const formatResToForm = (form, obj) => {
    Object.keys(form).forEach((key) => {
      if (obj[key]) {
        // 判断form[key]的类型，有数字，字符串，布尔，数组，但是value只有字符串，所以需要转换
        if (typeof form[key] === 'number') {
          form[key] = Number(obj[key])
        } else if (typeof form[key] === 'boolean') {
          form[key] = obj[key] === 'true'
        } else if (Array.isArray(form[key])) {
          form[key] = obj[key].split(',')
        } else {
          form[key] = obj[key]
        }
      }
    })
  }

  // 从数据库获取配置
  await optionUtils.find({}).then((data) => {
    // 返回格式list,total
    const config = {
      imgSettings: imgSettingConfig,
      siteSettings: siteSettingsConfig,
      commentSettings: commentSettingsConfig,
      rssSettings: rssSettingsConfig,
      emailSettings: emailSettingsConfig,
      otherSettings: otherSettingsConfig,
    }
    // 将data转换为object
    const obj = {}
    data.forEach((item) => {
      obj[item.name] = item.value
    })
    // 将obj转换为config
    formatResToForm(config.imgSettings, obj)
    formatResToForm(config.siteSettings, obj)
    formatResToForm(config.commentSettings, obj)
    formatResToForm(config.rssSettings, obj)
    formatResToForm(config.emailSettings, obj)
    formatResToForm(config.otherSettings, obj)
    // 将配置挂载到global上
    global.$globalConfig = config;
    global.$Mint = new Mint(config.otherSettings.siteBannedKeywordList)
    const showConfig = JSON.parse(JSON.stringify(config));
    // 将emailSettings.emailPassword设置为****
    showConfig.emailSettings.emailPassword = '****';
    console.info('globalConfig更新完成,配置如下:', showConfig);
  }).catch((err) => {
    console.error('globalConfig更新失败', err);
  })
}
exports.initGlobalConfig = initGlobalConfig;