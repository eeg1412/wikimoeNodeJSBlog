const cacheDataUtils = require('../../../config/cacheData')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  const { id } = req.query
  // id不能为空
  if (!id) {
    res.status(400).json({
      errors: [
        {
          message: 'id不能为空'
        }
      ]
    })
    return
  }
  let list = []
  if (global.$cacheData?.sortList) {
    list = global.$cacheData.sortList
  } else {
    await cacheDataUtils
      .getSortList()
      .then(data => {
        list = data
      })
      .catch(err => {
        userApiLog.error(`sort list get fail, ${JSON.stringify(err)}`)
      })
  }
  if (list.lenth === 0) {
    res.status(404).json({
      errors: [
        {
          message: '分类列表获取失败'
        }
      ]
    })
    return
  }
  // list是父子级关系，需要递归查找
  let sort = null
  const findSort = list => {
    for (let i = 0; i < list.length; i++) {
      if (String(list[i]._id) === id || list[i].alias === id) {
        sort = JSON.parse(JSON.stringify(list[i]))
        break
      }
      if (list[i].children && list[i].children.length > 0) {
        findSort(list[i].children)
      }
    }
  }
  findSort(list)
  if (!sort) {
    res.status(404).json({
      errors: [
        {
          message: '分类不存在'
        }
      ]
    })
    return
  }
  // 返回的key
  const returnKey = ['_id', 'sortname', 'taxis', 'description']
  // 过滤掉不需要的key
  Object.keys(sort).forEach(key => {
    if (!returnKey.includes(key)) {
      delete sort[key]
    }
  })
  res.send(sort)
}
