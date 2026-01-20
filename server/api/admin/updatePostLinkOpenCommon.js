const utils = require('../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

// Map of type to corresponding utils and display names
const typeConfig = {
  bangumi: {
    utils: require('../../mongodb/utils/bangumis'),
    displayName: '番剧',
    logName: 'bangumi'
  },
  book: {
    utils: require('../../mongodb/utils/books'),
    displayName: '书籍',
    logName: 'book'
  },
  game: {
    utils: require('../../mongodb/utils/games'),
    displayName: '游戏',
    logName: 'game'
  },
  movie: {
    utils: require('../../mongodb/utils/movies'),
    displayName: '电影',
    logName: 'movie'
  }
}

/**
 * Common function to update postLinkOpen field for different content types
 * @param {string} type - Content type: 'bangumi', 'book', 'game', or 'movie'
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
module.exports = async function updatePostLinkOpenCommon(type, req, res, next) {
  // Validate type parameter
  const config = typeConfig[type]
  if (!config) {
    res.status(400).json({
      errors: [
        {
          message: '无效的类型参数'
        }
      ]
    })
    return
  }

  const { id, postLinkOpen } = req.body
  const params = { id, postLinkOpen }
  const rule = [
    { key: 'id', label: 'id', type: 'isMongoId', required: true },
    {
      key: 'postLinkOpen',
      label: '文章链接开关',
      strict: true,
      strictType: 'boolean',
      required: true
    }
  ]

  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const updateData = {
    postLinkOpen
  }

  const contentUtils = config.utils

  contentUtils
    .updateOne({ _id: id }, updateData)
    .then(data => {
      if (data.modifiedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败'
            }
          ]
        })
        return
      }
      res.send({
        data: data
      })
      adminApiLog.info(`${config.logName} update postLinkOpen success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: `${config.displayName}文章链接开关更新失败`
          }
        ]
      })
      adminApiLog.error(
        `${config.logName} update postLinkOpen fail, ${logErrorToText(err)}`
      )
    })
}
