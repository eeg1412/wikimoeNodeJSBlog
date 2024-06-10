const { SitemapStream } = require('sitemap')
const { createWriteStream, createReadStream, constants } = require('fs');
const { access, unlink } = require('fs').promises;
const utils = require('./utils')
const postUtils = require('../mongodb/utils/posts')
const path = require('path')
const sitemapCacheFolder = './cache/sitemap'

exports.updateSitemap = async () => {
  const promise = new Promise(async (resolve, reject) => {
    console.info('creating sitemap')
    const siteSettings = global.$globalConfig?.siteSettings || {}
    const { siteUrl, siteEnableSitemap } = siteSettings
    if (siteEnableSitemap !== true) {
      console.info(`sitemap not enabled`)
      // 删除旧的sitemap
      // 检查 sitemapCacheFolder里的sitemap.xml是否存在，存在则删除
      const sitemapPath = path.join(sitemapCacheFolder, 'sitemap.xml');
      try {
        await access(sitemapPath);
        await unlink(sitemapPath);
      } catch (error) {
        if (error.code !== 'ENOENT') { // ENOENT 错误表示文件不存在，忽略这个错误
          return reject(error)
        }
        resolve()
      }
      resolve()
      return null
    }

    // 创建SitemapStream实例
    const sitemapStream = new SitemapStream({ hostname: siteUrl, xslUrl: '/sitemap.xsl' });
    const writeStream = createWriteStream(path.join(sitemapCacheFolder, 'sitemap.xml'));
    sitemapStream.pipe(writeStream);
    writeStream.on('finish', () => {
      console.info('Sitemap has been written to sitemap.xml successfully.');
      resolve()
    });
    writeStream.on('error', (err) => {
      console.error(err)
      reject(err)
    });
    // 添加首页
    sitemapStream.write({ url: '/', changefreq: 'always', priority: 1, lastmod: new Date() });
    // 添加页面
    const params = {
      status: 1,
      type: 3
    }
    const sort = {
      date: -1,
      _id: -1
    }
    const pageCursor = postUtils.findCursor(params, sort, '_id date alias lastChangDate date')
    console.info('creating sitemap type is page')
    for await (const page of pageCursor) {
      sitemapStream.write({
        url: `/page/${page.alias || page._id}`,
        changefreq: 'always',
        priority: 0.8,
        lastmod: page.lastChangDate
      });
    }
    console.info('creating sitemap type is page done')
    // 添加博客
    params.type = 1
    const blogCursor = postUtils.findCursor(params, sort, '_id date alias lastChangDate date')
    console.info('creating sitemap type is blog')
    for await (const blog of blogCursor) {
      sitemapStream.write({
        url: `/post/${blog.alias || blog._id}`,
        changefreq: 'always',
        priority: 0.5,
        lastmod: blog.lastChangDate
      });
    }
    console.info('creating sitemap type is blog done')
    // 添加推文
    params.type = 2
    const tweetCursor = postUtils.findCursor(params, sort, '_id date alias lastChangDate date')
    console.info('creating sitemap type is tweet')
    for await (const tweet of tweetCursor) {
      sitemapStream.write({
        url: `/post/${tweet.alias || tweet._id}`,
        changefreq: 'always',
        priority: 0.3,
        lastmod: tweet.lastChangDate
      });
    }
    console.info('creating sitemap type is tweet done')
    // 结束
    sitemapStream.end();
    console.info('sitemap done')
  })
  return promise
}

exports.reflushSitemap = async () => {
  await utils.executeInLock('reflushSitemap', async () => {
    await this.updateSitemap()
  })
}

exports.getSitemap = async (req, res) => {
  const sitemapPath = path.join(sitemapCacheFolder, 'sitemap.xml');
  try {
    await access(sitemapPath, constants.R_OK);
    const readStream = createReadStream(sitemapPath);
    res.setHeader('Content-Type', 'application/xml');
    readStream.pipe(res);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).send('sitemap not found');
    } else {
      res.status(500).send('server error');
    }
  }
};