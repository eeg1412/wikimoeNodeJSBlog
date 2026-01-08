const almanacsModel = require('../models/almanacs')

exports.save = async function (parmas) {
  // document作成
  const almanacs = new almanacsModel(parmas)
  // document保存
  return await almanacs.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await almanacsModel.findOne(parmas, projection)
}

// 查找所有
exports.find = async function (parmas, sort, projection, options = {}) {
  // document查询
  const q = almanacsModel.find(parmas, projection).sort(sort)
  if (options.lean) {
    q.lean()
  }
  return await q
}

// 分页查询
exports.findPage = async function (parmas, sort, page = 1, limit = 9999, projection) {
  // document查询
  const list = await almanacsModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await almanacsModel.countDocuments(parmas)
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
  return await almanacsModel.updateOne(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await almanacsModel.deleteOne(filters)
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await almanacsModel.deleteMany(filters)
}
