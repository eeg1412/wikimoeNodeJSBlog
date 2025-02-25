const bangumiUtils = require('../../../mongodb/utils/bangumis')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  let { year, season, page, sortType, status, keyword } = req.query
  let size = 20
  const params = {
    status: 1,
  }
  if (year) {
    params.year = year
  }
  if (season) {
    params.season = season
  }
  if (status) {
    const statusList = [99]
    const statusNumber = Number(status)
    // 如果status在statusList中，就加入查询条件
    if (statusList.includes(statusNumber)) {
      switch (statusNumber) {
        case 99:
          params.giveUp = true
          break;

        default:
          break;
      }

    }
  }

  if (keyword) {
    keyword = String(keyword)
    // keyword去掉前后空格
    keyword = keyword?.trim()
    // 如果keyword超过20个字符，就截取前20个字符
    if (keyword.length > 20) {
      keyword = Array.from(keyword).slice(0, 20).join('');
    }
    const keywordArray = keyword.split(' ');
    const regexArray = keywordArray.map(keyword => {
      const escapedKeyword = utils.escapeSpecialChars(keyword);
      const regex = new RegExp(escapedKeyword, 'i');
      return regex;
    });
    // 检索title和excerpt
    params.$or = [
      {
        title: { $in: regexArray }
      },
      {
        label: { $in: regexArray }
      }
    ]
  }

  const rule = [
    {
      key: 'year',
      label: '年份',
      type: 'isInt',
      required: false,
    },
    {
      key: 'season',
      label: '季度',
      type: 'isInt',
      required: false,
      options: {
        min: 1,
        max: 4
      }
    },
    {
      key: 'page',
      label: '页码',
      type: 'isInt',
      required: false,
      options: {
        min: 1
      }
    }
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }



  let sort = {
    year: -1,
    season: -1,
    rating: -1,
    _id: -1,
  }
  if (sortType === 'rating') {
    sort = {
      rating: -1,
      year: -1,
      season: -1,
      _id: -1,
    }
  }

  bangumiUtils.findPage(params, sort, page, size, '_id cover label rating season status summary title year giveUp urlList').then((data) => {
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
