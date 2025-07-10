const voteUtils = require('../../../mongodb/utils/votes')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const { title, maxSelect, showResultAfter, status, options, endTime } =
    req.body
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
        max: options.length
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
  // 校验options
  // options必须为数组
  const checkedOptions = []
  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    const optionParams = {
      title: option.title,
      sort: Number(option.sort)
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
  if (checkedOptions.length < 2) {
    res.status(400).json({
      errors: [
        {
          message: '选项数不能少于2个'
        }
      ]
    })
    return
  }
  params.options = checkedOptions
  // save
  voteUtils
    .save(params)
    .then(data => {
      res.send({
        data: data
      })
      adminApiLog.info(`vote create success`)
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '投票创建失败'
          }
        ]
      })
      adminApiLog.error(`vote create fail, ${logErrorToText(err)}`)
    })
}
