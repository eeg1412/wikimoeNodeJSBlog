const usersModel = require('../models/users')

exports.save = async function (parmas) {
  // document作成
  const users = new usersModel(parmas)
  // document保存
  return await users.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await usersModel.findOne(parmas, projection).populate('cover')
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await usersModel.find(parmas, projection).sort(sort)
}
// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await usersModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await usersModel.countDocuments(parmas)
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
  return await usersModel.updateOne(filters, parmas)
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await usersModel.deleteMany(filters)
}
// deleteOne
exports.deleteOne = async function (filters) {
  // document查询
  return await usersModel.deleteOne(filters)
}

// updateMany
exports.updateMany = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1, ...parmas.$inc }
  return await usersModel.updateMany(filters, parmas)
}
