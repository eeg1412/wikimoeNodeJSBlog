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
  // 校验格式
  const params = {
    sortname,
    alias,
    taxis,
    parent,
    description
  }
  const formCheck = {
    id,
    __v,
    ...params
  }
  const rule = [
    {
      key: 'id',
      label: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      key: 'sortname',
      label: '分类名称',
      required: true,
      strict: true,
      strictType: 'string'
    },
    {
      key: 'alias',
      label: '分类别名',
      strict: true,
      strictType: 'string'
    },
    {
      key: 'taxis',
      label: '排序值',
      strict: true,
      strictType: 'number'
    },
    {
      key: 'description',
      label: '分类描述',
      strict: true,
      strictType: 'string'
    },
    {
      key: '__v',
      label: '__v',
      required: true,
      strict: true,
      strictType: 'number'
    }
  ]
  if (parent) {
    rule.push({
      key: 'parent',
      label: '父级分类',
      type: 'isMongoId'
    })
  }
  const errors = utils.checkForm(formCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }

  // parent 不能和 id 相同
  if (parent === id) {
    res.status(400).json({
      errors: [
        {
          message: '父级不能和自己相同'
        }
      ]
    })
    return
  }
  if (alias) {
    // alias如果存在，不能超过64个字符
    if (alias.length > 64) {
      res.status(400).json({
        errors: [
          {
            message: '别名不能超过64个字符'
          }
        ]
      })
      return
    }
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
        errors: [
          {
            message: '分类别名已存在'
          }
        ]
      })
      return
    }
  }
  // updateOne
  sortUtils
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
      res.send({
        data: data
      })
      adminApiLog.info(`sort:${sortname} update success`)
      cacheDataUtils.getSortList()
      // utils.reflushBlogCache()
    })
    .catch(err => {
      res.status(400).json({
        errors: [
          {
            message: '分类更新失败'
          }
        ]
      })
      adminApiLog.error(`sort:${sortname} update fail, ${logErrorToText(err)}`)
    })
}
