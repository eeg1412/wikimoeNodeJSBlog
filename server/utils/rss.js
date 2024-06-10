const Feed = require('feed').Feed;
const postUtils = require('../mongodb/utils/posts')
const utils = require('./utils')
const fs = require('fs')
const path = require('path')
const rssCacheFolder = './cache/rss'

exports.updateRSS = async (type) => {
  const prmise = new Promise(async (resolve, reject) => {
    console.info('creating rss:' + type)
    const config = global.$globalConfig?.rssSettings || {}
    const { siteEnableRss, siteRssMaxCount } = config
    const siteSettings = global.$globalConfig?.siteSettings || {}
    const { siteTitle, siteUrl, siteDescription, siteLogo, siteFavicon } = siteSettings
    if (siteEnableRss !== true) {
      console.info(`rss:${type} not enabled`)
      return resolve(null)
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
    const data = await postUtils.findPage(params, sort, 1, size, undefined, { authorFilter: 'nickname' }).then((res) => {
      return res
    }).catch(err => {
      console.error(err)
      return null
    })
    if (!data) {
      return reject('no data')
    }
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
      const { title, excerpt, content, _id, author, type, date, alias } = item
      // 注意如果用到作者的话，务必在更改作者的时候更新rss！！！
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
        id: `${siteUrl}/post/${alias || _id}`,
        link: `${siteUrl}/post/${alias || _id}`,
        description: newContent,
        date: new Date(item.date),
      });
    })
    const rssXML = feed.rss2()
    // 写入文件
    const rssPath = path.join(rssCacheFolder, `${type}.xml`)
    fs.writeFileSync(rssPath, rssXML)
    resolve(rssXML)
    console.info('rss created:' + type)
  })
  return prmise
}

exports.reflushRSS = async () => {
  const config = global.$globalConfig?.rssSettings || {}
  const { siteEnableRss } = config
  await utils.executeInLock('reflushRSS', async () => {
    if (siteEnableRss !== true) {
      console.info('rss not enabled delete rss files')
      // 删除rss文件夹里的所有文件
      const files = fs.readdirSync(rssCacheFolder)
      files.forEach((file) => {
        const filePath = path.join(rssCacheFolder, file)
        fs.unlinkSync(filePath)
      })
      console.info('rss files deleted')
      return null
    }
    const promiseArray = [
      this.updateRSS('all'),
      this.updateRSS('blog'),
      this.updateRSS('tweet')
    ]
    await Promise.all(promiseArray).then((res) => {
      return res
    }).catch(err => {
      console.error(err)
      return null
    })
  })
}

exports.getRSS = (type) => {
  // 校验type只能是all、blog、tweet
  if (!['all', 'blog', 'tweet'].includes(type)) {
    return null
  }
  const path = `${rssCacheFolder}/${type}.xml`
  // if (!fs.existsSync(path)) {
  //   return null
  // }
  // // 读取文件
  // return fs.readFileSync(path, 'utf-8')
  const promise = new Promise((resolve, reject) => {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        return resolve(null)
      }
      fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
          console.error(err)
          return reject(null)
        }
        resolve(data)
      })
    })
  })
  return promise
}