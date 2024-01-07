var express = require('express')
var router = express.Router()
const Feed = require('feed').Feed;
const postUtils = require('../../mongodb/utils/posts')

router.get('/', async function (req, res, next) {
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
    const { title, excerpt, content, _id, author } = item
    feed.addItem({
      title: title || excerpt,
      id: _id,
      link: `${siteUrl}/post/${_id}`,
      description: excerpt || content,
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