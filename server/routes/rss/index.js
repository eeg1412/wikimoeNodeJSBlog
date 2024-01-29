var express = require('express')
var router = express.Router()
const Feed = require('feed').Feed;
const postUtils = require('../../mongodb/utils/posts')
const rsslogUtils = require('../../mongodb/utils/rsslogs')
const utils = require('../../utils/utils')
// const moment = require('moment-timezone');
router.get('/:type?', async function (req, res, next) {
  const type = req.params.type
  const config = global.$globalConfig?.rssSettings || {}
  const { siteEnableRss, siteRssMaxCount } = config
  const siteSettings = global.$globalConfig?.siteSettings || {}
  const { siteTitle, siteUrl, siteDescription, siteLogo, siteFavicon } = siteSettings
  if (siteEnableRss !== true) {
    res.status(404).send('Not found')
    return
  }
  const params = {
    status: 1,
    // type是1或者2
    type: {
      $in: [1, 2]
    }
  }
  if (type === 'blog') {
    params.type = 1
  }
  if (type === 'tweet') {
    params.type = 2
  }
  const sort = {
    date: -1,
    _id: -1
  }
  const size = parseInt(siteRssMaxCount) || 1
  const data = await postUtils.findPage(params, sort, 1, size, undefined, { authorFilter: 'nickname' })
  const { list } = data
  let feedLinksRss = `${siteUrl}/rss`
  if (type === 'blog') {
    feedLinksRss = `${siteUrl}/rss/blog`
  } else if (type === 'tweet') {
    feedLinksRss = `${siteUrl}/rss/tweet`
  }
  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    language: 'zh-CN',
    image: `${siteUrl}${siteLogo}`,
    favicon: `${siteUrl}${siteFavicon}`,
    generator: 'wikimoeBlog',
    feedLinks: {
      rss: feedLinksRss,
    },
  });
  list.forEach((item) => {
    const { title, excerpt, content, _id, author, type, date } = item
    let newTitle = title
    let newContent = content
    if (type === 2) {
      // 推文时，标题为【nickname在xxxx年xx月xx日xx点xx分发表了推文】
      // const authorName = author.nickname
      // const siteTimeZone = global.$globalConfig.siteSettings.siteTimeZone || 'Asia/Shanghai'
      // const dateStr = moment(date).tz(siteTimeZone).format('YYYY年M月D日H点m分')
      // newTitle = `${authorName}在${dateStr}发布了一篇推文`

      // 将excerpt去掉换行符设定为newTitle，最大长度为50，超过50的部分用...代替
      newTitle = excerpt.replace(/\n/g, '')
      if (newTitle.length > 50) {
        newTitle = newTitle.substring(0, 50) + '...'
      }
      newContent = `<p>${excerpt}</p>`
      // 换行符替换为br标签
      newContent = newContent.replace(/\n/g, '<br/>')
      // 遍历coverImages，以图片形式展示
      const coverImages = item.coverImages || []
      coverImages.forEach((image) => {
        const imageIsVideo = image.mimetype.startsWith('video')
        const createdAt = new Date(image.createdAt).getTime()
        if (imageIsVideo) {
          newContent += `<p><video src="${siteUrl}${image.filepath}" controls="controls" playsinline="true" preload="none" muted="muted" poster="${siteUrl}${image.thumfor}?${createdAt}" loop="loop" style="border-radius: 10px; margin-bottom: 10px; max-width: 100%;"></video></p>`
        } else {
          newContent += `<p><img src="${siteUrl}${image.thumfor || image.filepath}" alt="${image.name}" style="border-radius: 10px; margin-bottom: 10px; max-width: 100%;" /></p>`
        }
      })
    }
    feed.addItem({
      title: newTitle,
      id: `${siteUrl}/post/${_id}`,
      link: `${siteUrl}/post/${_id}`,
      description: newContent,
      date: new Date(item.date),
    });
  })
  res.set('Content-Type', 'application/rss+xml; charset=UTF-8');
  res.send(feed.rss2());

  // 记录日志
  const ip = utils.getUserIp(req)
  const rsslogParams = {
    ip: ip,
    ipInfo: await utils.IP2LocationUtils(ip, null, null, false),
    deviceInfo: utils.deviceUAInfoUtils(req),
    rssPath: req.path
  }
  let uaStr = req.headers['user-agent'] || ''
  // 最多1000个字符
  if (uaStr.length > 1000) {
    uaStr = uaStr.substring(0, 1000)
  }
  // 查找ua里面的url链接
  const uaUrl = uaStr.match(/(https?:\/\/[^\s;)]+)/g)
  if (uaUrl && uaUrl.length > 0) {
    rsslogParams.reader = uaUrl[0]
  }
  await rsslogUtils.save(rsslogParams)
})

module.exports = router