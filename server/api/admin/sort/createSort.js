
const sortUtils = require('../../../mongodb/utils/sorts')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

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
  // save
  sortUtils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(`sort:${sortname} create success`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '分类创建失败'
      }]
    })
    adminApiLog.error(`sort:${sortname} create fail, ${JSON.stringify(err)}`)
  })

}
