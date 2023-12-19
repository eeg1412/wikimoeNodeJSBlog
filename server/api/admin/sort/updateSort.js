
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
  const { sortname, alias, taxis, description, id, __v } = req.body
  const parent = req.body.parent || null
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
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
      },
      // 排除自己
      _id: {
        $ne: id
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
  // updateOne
  sortUtils.updateOne({ _id: id, __v }, params).then((data) => {
    if (data.modifiedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '更新失败'
        }]
      })
      return
    }
    res.send({
      data: data
    })
    adminApiLog.info(`sort:${sortname} update success`)
    cacheDataUtils.getSortList()
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '分类更新失败'
      }]
    })
    adminApiLog.error(`sort:${sortname} update fail, ${JSON.stringify(err)}`)
  })
}
