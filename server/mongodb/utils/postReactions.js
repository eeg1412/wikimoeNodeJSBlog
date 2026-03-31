const postReactionsModel = require('../models/postReactions')

exports.save = async function (parmas) {
  // document作成
  const postReactions = new postReactionsModel(parmas)
  // document保存
  return await postReactions.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await postReactionsModel.findOne(parmas, projection)
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await postReactionsModel.find(parmas, projection).sort(sort)
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await postReactionsModel
    .find(parmas, projection)
    .populate('post', 'title _id excerpt alias type')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await postReactionsModel.countDocuments(parmas)
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
  return await postReactionsModel.updateOne(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await postReactionsModel.deleteOne(filters)
}
// 删除多个
exports.deleteMany = async function (filters) {
  // document查询
  return await postReactionsModel.deleteMany(filters)
}
// findOneAndUpdate
exports.findOneAndUpdate = async function (filters, parmas, options) {
  // document查询
  return await postReactionsModel.findOneAndUpdate(filters, parmas, options)
}
// 聚合
exports.aggregate = async function (parmas) {
  // document查询
  return await postReactionsModel.aggregate(parmas)
}
