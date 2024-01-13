var express = require('express')
var router = express.Router()
const Feed = require('feed').Feed;
const postUtils = require('../../mongodb/utils/posts')
const moment = require('moment-timezone');

router.get('/:type?', async function (req, res, next) {
  const type = req.params.type
  const config = global.$globalConfig?.rssSettings || {}
  const { siteEnableRss, siteRssMaxCount } = config
  const siteSettings = global.$globalConfig?.siteSettings || {}
  const { siteTitle, siteUrl, siteDescription } = siteSettings
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
  if (type === '1') {
    params.type = 1
  }
  if (type === '2') {
    params.type = 2
  }
  const sort = {
    date: -1,
    _id: -1
  }
  const size = parseInt(siteRssMaxCount) || 1
  const data = await postUtils.findPage(params, sort, 1, size, undefined, { authorFilter: 'nickname' })
  const { list } = data
  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    language: 'zh-CN',
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    generator: 'wikimoeBlog',
    feedLinks: {
      rss: `${siteUrl}/rss`,
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
        newContent += `<p><img src="${siteUrl}${image.thumfor || image.filepath}" alt="${image.name}" style="border-radius: 10px; margin-bottom: 10px; max-width: 100%;" /></p>`
      })
    }
    feed.addItem({
      title: newTitle,
      id: _id,
      link: `${siteUrl}/post/${_id}`,
      description: newContent,
      author: [
        {
          email: siteTitle,
          name: author.nickname,
        },
      ],
      date: new Date(item.date),
    });
  })
  res.set('Content-Type', 'text/xml');
  res.send(feed.rss2());
})

module.exports = router