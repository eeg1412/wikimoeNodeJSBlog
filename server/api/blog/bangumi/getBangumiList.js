const bangumiUtils = require('../../../mongodb/utils/bangumis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { year, season } = req.query

  const params = {
    status: 1,
    year,
    season,
  }
  const rule = [
    {
      key: 'year',
      label: '年份',
      type: null,
      required: true,
    },
    {
      key: 'season',
      label: '季度',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }



  const sort = {
    rating: -1,
    _id: -1,
  }
  bangumiUtils.find(params, sort, '_id cover label rating season status summary title year urlList').then((data) => {
    // 返回格式list,total
    res.send({
      data: data,
    })

  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '番剧列表获取失败'
      }]
    })
    userApiLog.error(`bangumi list get fail, ${JSON.stringify(err)
      }`)
  })
}
