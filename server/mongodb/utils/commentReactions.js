const commentReactionsModel = require('../models/commentReactions')

exports.save = async function (parmas) {
  // document作成
  const commentReactions = new commentReactionsModel(parmas)
  // document保存
  return await commentReactions.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await commentReactionsModel.findOne(parmas, projection)
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await commentReactionsModel.find(parmas, projection).sort(sort)
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await commentReactionsModel
    .find(parmas, projection)
    .populate('comment', 'content _id')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await commentReactionsModel.countDocuments(parmas)
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
  return await commentReactionsModel.updateOne(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await commentReactionsModel.deleteOne(filters)
}
// 删除多个
exports.deleteMany = async function (filters) {
  // document查询
  return await commentReactionsModel.deleteMany(filters)
}
// findOneAndUpdate
exports.findOneAndUpdate = async function (filters, parmas, options) {
  // document查询
  return await commentReactionsModel.findOneAndUpdate(filters, parmas, options)
}
