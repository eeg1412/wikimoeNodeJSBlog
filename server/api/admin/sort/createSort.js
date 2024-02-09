
const sortUtils = require('../../../mongodb/utils/sorts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')
const cacheDataUtils = require('../../../config/cacheData')

module.exports = async function (req, res, next) {
  // sortname	String	是	否	无	分类名称
  // alias	String	否	否	无	分类别名
  // taxis	Number	否	否	0	排序值
  // parent	ObjectId	否	否	无	父级分类 ID
  // description	String	否	否	无	分类描述
  const { sortname, alias, taxis, description } = req.body
  const parent = req.body.parent || null
  // 校验格式
  const params = {
    sortname: sortname,
    alias: alias,
    taxis: taxis,
    parent: parent,
    description: description,
  }
  const rule = [
    {
      key: 'sortname',
      label: '分类名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  if (alias) {
    // 查询alias是否存在，查询条件时大小写不敏感的
    const query = {
      alias: {
        $regex: new RegExp('^' + alias + '$', 'i')
      }
    }
    const result = await sortUtils.findOne(query)
    if (result) {
      res.status(400).json({
        errors: [{
          message: '分类别名已存在'
        }]
      })
      return
    }
  }


  // save
  sortUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`sort:${sortname} create success`)
    cacheDataUtils.getSortList()
    // utils.reflushBlogCache()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '分类创建失败'
      }]
    })
    adminApiLog.error(`sort:${sortname} create fail, ${logErrorToText(err)}`)
  })

}
