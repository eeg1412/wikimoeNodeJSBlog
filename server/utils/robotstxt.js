const { createReadStream, constants } = require('fs')
const { access, unlink, mkdir, writeFile } = require('fs').promises
const utils = require('./utils')
const path = require('path')
const robotsCacheFolder = './seo/robots'

exports.updateRobotsTxt = async () => {
  const promise = new Promise(async (resolve, reject) => {
    const siteRobotsTxt =
      global.$globalConfig?.siteSettings?.siteRobotsTxt || ''

    // 检查目录是否存在，不存在则创建
    await mkdir(robotsCacheFolder, { recursive: true })

    // 写入robots.txt
    const robotsPath = path.join(robotsCacheFolder, 'robots.txt')
    await writeFile(robotsPath, siteRobotsTxt)
    console.info('Robots.txt has been written successfully.')
    resolve()
  })
  return promise
}

exports.reflushRobotsTxt = async () => {
  await utils.executeInLock('reflushRobotsTxt', async () => {
    await this.updateRobotsTxt()
  })
}

exports.getRobotsTxt = async (req, res) => {
  const robotsPath = path.join(robotsCacheFolder, 'robots.txt')
  try {
    await access(robotsPath, constants.R_OK)
    const readStream = createReadStream(robotsPath)
    res.setHeader('Content-Type', 'text/plain')
    readStream.pipe(res)
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).send('robots.txt not found')
    } else {
      res.status(500).send('server error')
    }
  }
}
