const fs = require('fs')
const path = require('path')

const apiPath = path.resolve('./api/admin')
console.log(apiPath)

// 获取node run creatCRUD 时的参数
const args = process.argv.slice(2)
// 0是表名，1是中文名
const tableName = args[0]
const chineseName = args[1]

// 创建tableName文件夹
const tableNamePath = path.resolve(apiPath, tableName)
if (!fs.existsSync(tableNamePath)) {
  fs.mkdirSync(tableNamePath)
}

// 将tableName首字母替换为大写
const tableNameFirstLetter = tableName.replace(
  tableName[0],
  tableName[0].toUpperCase(),
)

const mongodbPath = path.resolve('./mongodb')
// model
const modelTemplate = (tableName, chineseName) => {
  const template = `var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var ${tableName}s = new Schema({
}, { timestamps: true });

module.exports = mongoose.model('${tableName}s', ${tableName}s);`
  // 写入文件
  const filePath = path.resolve(mongodbPath, 'models', `${tableName}s.js`)
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}
const modelUtilsTemplate = (tableName, chineseName) => {
  const template = `const ${tableName}sModel = require('../models/${tableName}s');

exports.save = async function (parmas) {
  // document作成
  const ${tableName}s = new ${tableName}sModel(parmas);
  // document保存
  return await ${tableName}s.save()
}


exports.findOne = async function (parmas, projection, options = {}) {
  // document查询
  const q = ${tableName}sModel.findOne(parmas, projection);
  if (options.lean) {
    q.lean();
  }
  return await q;
}

// 查找所有
exports.find = async function (parmas, sort, projection, options = {}) {
  // document查询
  const q = ${tableName}sModel.find(parmas, projection).sort(sort);
  if (options.lean) {
    q.lean();
  }
  return await q;
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection, options = {}) {
  // document查询
  const q = ${tableName}sModel.find(parmas, projection).sort(sort).skip((page - 1) * limit).limit(limit);
  if (options.lean) {
    q.lean();
  }
  const list = await q;
  const total = await ${tableName}sModel.countDocuments(parmas);
  // 查询失败
  if (!list || total === undefined) {
    throw new Error('查询失败')
  }
  return {
    list,
    total
  }
}

exports.updateOne = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1, ...parmas.$inc }
  return await ${tableName}sModel.updateOne(filters, parmas);
}
// deleteMany
exports.deleteMany = async function (filters) {
  return await ${tableName}sModel.deleteMany(filters);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await ${tableName}sModel.deleteOne(filters);
}`
  // 写入文件
  const filePath = path.resolve(mongodbPath, 'utils', `${tableName}s.js`)
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}

const createTemplate = (tableName, chineseName) => {
  const template = `const ${tableName}Utils = require('../../../mongodb/utils/${tableName}s')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {

  const {  } = req.body
  // 校验格式
  const params = {
  }
  const rule = [

  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // save
  ${tableName}Utils.save(params).then((data) => {
    res.send({
      data: data
    })
    adminApiLog.info(\`${tableName} create success\`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '${chineseName}创建失败'
      }]
    })
    adminApiLog.error(\`${tableName} create fail, \${logErrorToText(err)}\`)
  })

}
`
  // 写入文件
  const filePath = path.resolve(
    tableNamePath,
    `create${tableNameFirstLetter}.js`,
  )
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}

// 删
const deleteTemplate = (tableName, chineseName) => {
  const template = `const ${tableName}Utils = require('../../../mongodb/utils/${tableName}s')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  const id = req.query.id
  if (!id) {
    res.status(400).json({
      errors: [{
        message: 'id不能为空'
      }]
    })
    return
  }
  //  删除${chineseName}
  ${tableName}Utils.deleteOne({ _id: id }).then((data) => {
    if (data.deletedCount === 0) {
      res.status(400).json({
        errors: [{
          message: '删除失败'
        }]
      })
      return
    }
    res.send({
      data: {
        message: '删除成功'
      }
    })
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '删除失败'
      }]
    })
    adminApiLog.error(\`${tableName} delete fail, \${logErrorToText(err)}\`)
  })
}`
  // 写入文件
  const filePath = path.resolve(
    tableNamePath,
    `delete${tableNameFirstLetter}.js`,
  )
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}

// 改
const updateTemplate = (tableName, chineseName) => {
  const template = `const ${tableName}Utils = require('../../../mongodb/utils/${tableName}s')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
  // ${tableName}name	String	是	否	无	${chineseName}名称
  const { ${tableName}name, id, __v } = req.body
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
    ${tableName}name: ${tableName}name,
  }
  const rule = [
    {
      key: '${tableName}name',
      label: '${chineseName}名称',
      type: null,
      required: true,
    },
  ]
  const errors = utils.checkForm(params, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  // updateOne
  ${tableName}Utils.updateOne({ _id: id, __v }, params).then((data) => {
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
    adminApiLog.info(\`${tableName} update success\`)
  }).catch((err) => {
    res.status(400).json({
      errors: [{
        message: '${chineseName}更新失败'
      }]
    })
    adminApiLog.error(\`${tableName} update fail, \${logErrorToText(err)}\`)
  })
}
`
  // 写入文件

  const filePath = path.resolve(
    tableNamePath,
    `update${tableNameFirstLetter}.js`,
  )
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}
// 查
const findTemplate = (tableName, chineseName) => {
  const template = `const ${tableName}Utils = require('../../../mongodb/utils/${tableName}s')
  const utils = require('../../../utils/utils')
  const log4js = require('log4js')
  const adminApiLog = log4js.getLogger('adminApi')
  
  module.exports = async function (req, res, next) {
    let { page, size, keyword } = req.query
    page = parseInt(page)
    size = parseInt(size)
    // 判断page和size是否为数字
    if (!utils.isNumber(page) || !utils.isNumber(size)) {
      res.status(400).json({
        errors: [{
          message: '参数错误'
        }]
      })
      return
    }
    const params = {
    }
    // 如果keyword存在，就加入查询条件
    if (keyword) {
      keyword = utils.escapeSpecialChars(keyword)
      params.${tableName}name = new RegExp(keyword, 'i')
    }
  
    const sort = {
      lastusetime: -1,
      _id: -1
    }
    ${tableName}Utils.findPage(params, sort, page, size).then((data) => {
      // 返回格式list,total
      res.send({
        list: data.list,
        total: data.total
      })
  
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: '${chineseName}列表获取失败'
        }]
      })
      adminApiLog.error(\`${tableName} list get fail, \${JSON.stringify(err)
    }\`)
    })
  }
`
  // 写入文件

  const filePath = path.resolve(
    tableNamePath,
    `get${tableNameFirstLetter}List.js`,
  )
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}
// 查一个
const findOneTemplate = (tableName, chineseName) => {
  const template = `const ${tableName}Utils = require('../../../mongodb/utils/${tableName}s')
  const utils = require('../../../utils/utils')
  const log4js = require('log4js')
  const adminApiLog = log4js.getLogger('adminApi')
  
  module.exports = async function (req, res, next) {
    const id = req.query.id
    if (!id) {
      res.status(400).json({
        errors: [{
          message: 'id不能为空'
        }]
      })
      return
    }
    // findOne
    ${tableName}Utils.findOne({ _id: id }).then((data) => {
      if (!data) {
        res.status(400).json({
          errors: [{
            message: '${chineseName}不存在'
          }]
        })
        return
      }
      res.send({
        data: data
      })
    }).catch((err) => {
      res.status(400).json({
        errors: [{
          message: '${chineseName}详情获取失败'
        }]
      })
      adminApiLog.error(\`${tableName} detail get fail, \${logErrorToText(err)}\`)
    })
  }
`
  // 写入文件

  const filePath = path.resolve(
    tableNamePath,
    `get${tableNameFirstLetter}Detail.js`,
  )
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}

modelTemplate(tableName, chineseName)
modelUtilsTemplate(tableName, chineseName)
createTemplate(tableName, chineseName)
deleteTemplate(tableName, chineseName)
updateTemplate(tableName, chineseName)
findTemplate(tableName, chineseName)
findOneTemplate(tableName, chineseName)
