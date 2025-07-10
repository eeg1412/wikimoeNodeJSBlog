const referrersModel = require('../models/referrers')

exports.save = async function (parmas) {
  // document作成
  const referrers = new referrersModel(parmas)
  // document保存
  return await referrers.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await referrersModel.findOne(parmas, projection)
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await referrersModel.find(parmas, projection).sort(sort)
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await referrersModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await referrersModel.countDocuments(parmas)
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
  return await referrersModel.updateOne(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await referrersModel.deleteOne(filters)
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await referrersModel.deleteMany(filters)
}
