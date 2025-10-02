const userLoginLogsModel = require('../models/userLoginLogs')

exports.save = async function (parmas) {
  // document作成
  const userLoginLogs = new userLoginLogsModel(parmas)
  // document保存
  return await userLoginLogs.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await userLoginLogsModel.findOne(parmas, projection)
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await userLoginLogsModel.find(parmas, projection).sort(sort)
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await userLoginLogsModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await userLoginLogsModel.countDocuments(parmas)
  // 查询失败
  if (!list || total === undefined) {
    throw new Error('查询失败')
  }
  return {
    list,
    total
  }
}

// 统计数量
exports.countDocuments = async function (parmas) {
  // document查询
  return await userLoginLogsModel.countDocuments(parmas)
}

exports.updateOne = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1, ...parmas.$inc }
  return await userLoginLogsModel.updateOne(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await userLoginLogsModel.deleteOne(filters)
}
// 删除多个
exports.deleteMany = async function (filters) {
  // document查询
  return await userLoginLogsModel.deleteMany(filters)
}
// findOneAndUpdate
exports.findOneAndUpdate = async function (filters, parmas, options) {
  // document查询
  return await userLoginLogsModel.findOneAndUpdate(filters, parmas, options)
}
// 聚合
exports.aggregate = async function (parmas) {
  // document查询
  return await userLoginLogsModel.aggregate(parmas)
}
