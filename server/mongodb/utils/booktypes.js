const booktypesModel = require('../models/booktypes')

exports.save = async function (parmas) {
  // document作成
  const booktypes = new booktypesModel(parmas)
  // document保存
  return await booktypes.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await booktypesModel.findOne(parmas, projection)
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await booktypesModel.find(parmas, projection).sort(sort)
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await booktypesModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await booktypesModel.countDocuments(parmas)
  // 查询失败
  if (!list || total === undefined) {
    throw new Error('查询失败')
  }
  return {
    list,
    total,
  }
}

exports.updateOne = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1, ...parmas.$inc }
  return await booktypesModel.updateOne(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await booktypesModel.deleteOne(filters)
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await booktypesModel.deleteMany(filters)
}
