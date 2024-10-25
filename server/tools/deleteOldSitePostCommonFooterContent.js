require('dotenv').config()
const chalk = require('chalk')
const db = require('./mongodb')
const postsUtil = require('../mongodb/utils/posts');
const optionUtils = require('../mongodb/utils/options')


const init = async () => {
  // 删除name为sitePostCommonFooterContent 和 sitePostCommonFooterContentIsRichMode 的数据
  console.log(chalk.green('删除旧的站点文章底部内容'))
  const res1 = await optionUtils.deleteMany({
    name: 'sitePostCommonFooterContent'
  })
  console.log(chalk.green('删除sitePostCommonFooterContent成功', JSON.stringify(res1)))
  const res2 = await optionUtils.deleteMany({
    name: 'sitePostCommonFooterContentIsRichMode'
  })
  console.log(chalk.green('删除sitePostCommonFooterContentIsRichMode成功', JSON.stringify(res2)))
  console.log(chalk.green('删除旧的站点文章底部内容成功'))
  // 关闭
  process.exit(0)
}

db.once('open', () => {
  init()
})
