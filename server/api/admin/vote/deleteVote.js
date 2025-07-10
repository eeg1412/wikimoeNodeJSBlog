const voteUtils = require('../../../mongodb/utils/votes')
const postUtils = require('../../../mongodb/utils/posts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空',
        },
      ],
    })
    return
  }
  //  删除投票
  voteUtils
    .deleteOne({ _id: id })
    .then((data) => {
      if (data.deletedCount === 0) {
        res.status(400).json({
          errors: [
            {
              message: '删除失败',
            },
          ],
        })
        return
      }
      postUtils
        .updateMany(
          {
            $or: [
              {
                voteList: id,
              },
              {
                contentVoteList: id,
              },
            ],
          },
          { $pull: { voteList: id, contentVoteList: id } },
        )
        .then((data) => {
          // console.log('data', data)
          res.send({
            data: {
              message: '删除成功',
            },
          })
        })
        .catch((err) => {
          res.status(400).json({
            errors: [
              {
                message: '删除失败',
              },
            ],
          })
          adminApiLog.error(`vote delete fail, ${logErrorToText(err)}`)
        })
    })
    .catch((err) => {
      res.status(400).json({
        errors: [
          {
            message: '删除失败',
          },
        ],
      })
      adminApiLog.error(`vote delete fail, ${logErrorToText(err)}`)
    })
}
