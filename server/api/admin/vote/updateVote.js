const voteUtils = require('../../../mongodb/utils/votes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const {
    id,
    __v,
    title,
    maxSelect,
    showResultAfter,
    status,
    options,
    endTime
  } = req.body
  if (!utils.isObjectId(id || '')) {
    res.status(400).json({
      errors: [
        {
          message: 'id格式不正确'
        }
      ]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [
        {
          message: '__v不能为空'
        }
      ]
    })
    return
  }

  // options 不是数组则报错
  if (!Array.isArray(options)) {
    res.status(400).json({
      errors: [
        {
          message: '选项格式不正确'
        }
      ]
    })
    return
  }

  const statusArr = [0, 1]
  if (statusArr.indexOf(status) === -1) {
    res.status(400).json({
      errors: [
        {
          message: '状态值不正确'
        }
      ]
    })
    return
  }
  utils
    .executeInLock(`voteupdate-${id}`, async () => {
      // 根据id和__v查询数据
      const voteData = await voteUtils.findOne({ _id: id, __v })
      if (!voteData) {
        res.status(400).json({
          errors: [
            {
              message: '更新失败，数据可能不存在或者已被修改'
            }
          ]
        })
        return
      }

      const voteOptionsLength = voteData.options.length
      // 查询options里action为add的个数
      const addLength = options.filter(option => option.action === 'add').length
      // 查询options里action为delete的个数
      const deleteLength = options.filter(
        option => option.action === 'delete'
      ).length
      // 最终options的个数
      const finalOptionsLength = voteOptionsLength + addLength - deleteLength
      if (finalOptionsLength < 2) {
        res.status(400).json({
          errors: [
            {
              message: '选项数不正确'
            }
          ]
        })
        return
      }

      // 校验格式
      const params = {
        title,
        maxSelect: Number(maxSelect),
        showResultAfter: showResultAfter ? true : false,
        endTime: endTime || null,
        status
      }
      const rule = [
        {
          key: 'title',
          label: '投票标题',
          required: true
        },
        {
          key: 'maxSelect',
          label: '最多可选择的选项数',
          required: true,
          type: 'isInt',
          options: {
            min: 1,
            max: finalOptionsLength
          }
        },
        {
          key: 'endTime',
          label: '结束时间',
          type: 'isISO8601',
          options: {
            strict: true,
            strictSeparator: true
          }
        }
      ]
      const errors = utils.checkForm(params, rule)
      if (errors.length > 0) {
        res.status(400).json({ errors })
        return
      }

      let deleteOptionVotes = 0
      const checkedOptions = []
      for (let i = 0; i < options.length; i++) {
        const option = options[i]
        const actionArr = ['add', 'delete', 'update']
        if (actionArr.indexOf(option.action) === -1) {
          res.status(400).json({
            errors: [
              {
                message: '选项action值不正确'
              }
            ]
          })
          return
        }
        if (option.action === 'delete' || option.action === 'update') {
          if (!utils.isObjectId(option._id || '')) {
            res.status(400).json({
              errors: [
                {
                  message: '选项id格式不正确'
                }
              ]
            })
            return
          }
          // 检查voteData里是否有该选项
          const voteOptions = voteData.options
          const optionData = voteOptions.find(
            optionData => optionData._id.toString() === option._id
          )
          if (!optionData) {
            res.status(400).json({
              errors: [
                {
                  message: '有不存在的选项'
                }
              ]
            })
            return
          }
          if (option.action === 'delete') {
            deleteOptionVotes += optionData.votes
          }
        }

        const optionParams = {
          _id: option._id || undefined,
          title: option.title,
          sort: Number(option.sort),
          action: option.action
        }
        const optionRule = [
          {
            key: 'title',
            label: '选项标题',
            required: true
          },
          {
            key: 'sort',
            label: '排序',
            required: true,
            type: 'isInt',
            options: {
              min: 0,
              max: 999999999
            }
          }
        ]
        const optionErrors = utils.checkForm(optionParams, optionRule)
        if (optionErrors.length > 0) {
          res.status(400).json({ errors })
          return
        }

        checkedOptions.push(optionParams)
      }

      if (deleteOptionVotes !== 0) {
        params.$inc = {
          votes: -deleteOptionVotes
        }
      }

      // updateOne
      voteUtils
        .updateOne({ _id: id, __v }, params)
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

          // update options
          const optionPromises = []
          for (let i = 0; i < checkedOptions.length; i++) {
            const option = checkedOptions[i]
            switch (option.action) {
              case 'add':
                optionPromises.push(
                  voteUtils.updateOneOptionsPromise(
                    {
                      _id: id
                    },
                    {
                      $push: {
                        options: {
                          title: option.title,
                          sort: option.sort
                        }
                      }
                    }
                  )
                )
                break
              case 'delete':
                optionPromises.push(
                  voteUtils.updateOneOptionsPromise(
                    {
                      _id: id
                    },
                    {
                      $pull: {
                        options: {
                          _id: option._id
                        }
                      }
                    }
                  )
                )
                break
              case 'update':
                optionPromises.push(
                  voteUtils.updateOneOptionsPromise(
                    {
                      _id: id,
                      'options._id': option._id
                    },
                    {
                      $set: {
                        'options.$.title': option.title,
                        'options.$.sort': option.sort
                      }
                    }
                  )
                )
                break

              default:
                break
            }
          }
          if (optionPromises.length > 0) {
            Promise.all(optionPromises)
              .then(optionData => {
                res.send({
                  votedata: data,
                  optiondata: optionData
                })
                adminApiLog.info(`vote update success`)
              })
              .catch(err => {
                res.status(400).json({
                  errors: [
                    {
                      message: '投票选项更新失败'
                    }
                  ]
                })
                adminApiLog.error(
                  `vote options update fail, ${logErrorToText(err)}`
                )
              })
          } else {
            res.send({
              votedata: data
            })
            adminApiLog.info(`vote update success`)
          }
        })
        .catch(err => {
          res.status(400).json({
            errors: [
              {
                message: '投票更新失败'
              }
            ]
          })
          adminApiLog.error(`vote update fail, ${logErrorToText(err)}`)
        })
    })
    .then(() => {
      console.info(`voteupdate-${id} unlock`)
    })
    .catch(err => {
      adminApiLog.error(`voteupdate-${id} unlock error, ${logErrorToText(err)}`)
    })
}
