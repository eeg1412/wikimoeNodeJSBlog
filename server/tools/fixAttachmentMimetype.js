require('dotenv').config()
const path = require('path')
const db = require('./mongodb')
const attachmentsUtils = require('../mongodb/utils/attachments')

async function fixMimeTypes() {
  const attachments = await attachmentsUtils.find()
  const promiseAll = attachments.map(async attachment => {
    const ext = path.extname(attachment.filepath)
    const mimeType = getMimeType(ext)
    if (mimeType && mimeType !== attachment.mimetype) {
      await attachmentsUtils.updateOne(
        { _id: attachment._id },
        { mimetype: mimeType }
      )
      console.log(`Attachment ${attachment._id} updated.`)
    }
  })
  await Promise.all(promiseAll)
}

function getMimeType(ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    // 添加更多的文件后缀名和 MIME 类型的映射
    default:
      return null
  }
}

db.once('open', () => {
  fixMimeTypes()
    .then(() => {
      console.log('Done')
      process.exit(0)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
})
