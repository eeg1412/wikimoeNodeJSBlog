const bookUtils = require('../../../mongodb/utils/books')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const fs = require('fs')
const path = require('path')

module.exports = async function (req, res, next) {
  const { idList, action, seriesId, status } = req.body

  if (!Array.isArray(idList) || idList.length === 0) {
    res.status(400).json({
      errors: [{ message: 'idList不能为空' }]
    })
    return
  }
  for (let i = 0; i < idList.length; i++) {
    if (!utils.isObjectId(idList[i])) {
      res.status(400).json({
        errors: [{ message: `idList中第${i + 1}个id格式错误` }]
      })
      return
    }
  }

  const validActions = ['addSeries', 'removeSeries', 'changeStatus', 'delete']
  if (!validActions.includes(action)) {
    res.status(400).json({
      errors: [{ message: '操作类型错误' }]
    })
    return
  }

  try {
    switch (action) {
      case 'addSeries': {
        if (!seriesId || !utils.isObjectId(seriesId)) {
          res.status(400).json({
            errors: [{ message: '请选择有效的系列' }]
          })
          return
        }
        await bookUtils.updateMany(
          { _id: { $in: idList } },
          { $set: { series: seriesId } }
        )
        break
      }
      case 'removeSeries': {
        await bookUtils.updateMany(
          { _id: { $in: idList } },
          { $set: { series: null } }
        )
        break
      }
      case 'changeStatus': {
        if (status === undefined || status === null) {
          res.status(400).json({
            errors: [{ message: '请选择状态' }]
          })
          return
        }
        const statusNum = Number(status)
        if (![0, 1].includes(statusNum)) {
          res.status(400).json({
            errors: [{ message: '状态值错误' }]
          })
          return
        }
        await bookUtils.updateMany(
          { _id: { $in: idList } },
          { $set: { status: statusNum } }
        )
        break
      }
      case 'delete': {
        for (const id of idList) {
          const oldData = await bookUtils.findOne({ _id: id })
          if (oldData && oldData.coverFileName) {
            const coverFolder = oldData.coverFolder
            const basePath = './public/upload/book/' + coverFolder + '/'
            const fileName = oldData.coverFileName
            try {
              fs.unlinkSync(path.join(basePath, fileName))
            } catch (error) {
              adminApiLog.error(
                `book batch delete cover fail, ${JSON.stringify(error)}`
              )
            }
          }
          await bookUtils.deleteOne({ _id: id })
        }
        await postUtils
          .updateMany(
            {
              $or: [
                { bookList: { $in: idList } },
                { contentBookList: { $in: idList } }
              ]
            },
            {
              $pull: {
                bookList: { $in: idList },
                contentBookList: { $in: idList }
              }
            }
          )
          .catch(() => {})
        break
      }
    }

    res.send({
      data: { message: '操作成功' }
    })
    adminApiLog.info(`book batch ${action} success`)
  } catch (err) {
    res.status(400).json({
      errors: [{ message: '批量操作失败' }]
    })
    adminApiLog.error(`book batch ${action} fail, ${logErrorToText(err)}`)
  }
}
