const voteUtils = require('../../../mongodb/utils/votes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { id, __v, title, maxSelect, showResult, status, options, endTime } = req.body
  if (!utils.isObjectId(id || '')) {
    res.status(400).json({
      errors: [{
        message: 'id格式不正确'
      }]
    })
    return
  }
  // __v 可以为零，但不能为空/null/undefined
  if (__v === undefined || __v === null) {
    res.status(400).json({
      errors: [{
        message: '__v不能为空'
      }]
    })
    return
  }

  // options 不是数组则报错
  if (!Array.isArray(options)) {
    res.status(400).json({
      errors: [{
        message: '选项格式不正确'
      }]
    })
    return
  }

  const statusArr = [0, 1]
  if (statusArr.indexOf(status) === -1) {
    res.status(400).json({
      errors: [{
        message: '状态值不正确'
      }]
    })
    return
  }

  // 校验格式
  const params = {
    title,
    maxSelect: Number(maxSelect),
    showResult: showResult ? true : false,
    endtime: endTime || null,
    status,
  }
  const rule = [
    {
      key: 'title',
      label: '投票标题',
      required: true,
    },
    {
      key: 'maxSelect',
      label: '最多可选择的选项数',
      required: true,
      type: 'isInt',
      options: {
        min: 1,
        max: options.length
      }
    },
    {
      key: 'endTime',
      label: '结束时间',
      type: 'isISO8601',
      required: true,
      options: {
        strict: true,
        strictSeparator: true,
      },
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  const checkedOptions = []
  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    const actionArr = ['add', 'delete', 'update']
    if (actionArr.indexOf(option.action) === -1) {
      res.status(400).json({
        errors: [{
          message: '选项action值不正确'
        }]
      })
      return
    }
    if (option.action === 'delete' || option.action === 'update') {
      if (!utils.isObjectId(option.id || '')) {
        res.status(400).json({
          errors: [{
            message: '选项id格式不正确'
          }]
        })
        return
      }
    }


    const optionParams = {
      _id: option.id || undefined,
      title: option.title,
      sort: Number(option.sort),
      action: option.action,
    }
    const optionRule = [
      {
        key: 'title',
        label: '选项标题',
        required: true,
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
  if (checkedOptions.length < 2) {
    res.status(400).json({
      errors: [{
        message: '选项数不能少于2个'
      }]
    })
    return
  }


  // updateOne
  voteUtils.updateOne({ _id: id, __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }

    // update options
    const optionPromises = []
    for (let i = 0; i < checkedOptions.length; i++) {
      const option = checkedOptions[i]
      switch (option.action) {
        case 'add':
          optionPromises.push(voteUtils.updateOne({
            _id: id,
          }, {
            $push: {
              options: {
                title: option.title,
                sort: option.sort
              }
            }
          }))
          break;
        case 'delete':
          optionPromises.push(voteUtils.updateOne({
            _id: id,
          }, {
            $pull: {
              options: {
                _id: option._id
              }
            }
          }))
          break;
        case 'update':
          optionPromises.push(voteUtils.updateOne({
            _id: id,
            'options._id': option._id
          }, {
            $set: {
              'options.$.title': option.title,
              'options.$.sort': option.sort
            }
          }))
          break;

        default:
          break;
      }
      Promise.all(optionPromises).then((optionData) => {
        res.send({
          votedata: data,
          optiondata: optionData
        })
      }).catch((err) => {
        res.status(400).json({
          errors: [{
            message: '投票选项更新失败'
          }]
        })
        adminApiLog.error(`vote options update fail, ${logErrorToText(err)}`)
      })
    }
    // res.send({
    //   data: data
    // })
    adminApiLog.info(`vote update success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '投票更新失败'
      }]
    })
    adminApiLog.error(`vote update fail, ${logErrorToText(err)}`)
  })
}
