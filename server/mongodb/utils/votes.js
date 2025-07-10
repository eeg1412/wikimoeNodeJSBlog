const votesModel = require('../models/votes')

exports.save = async function (parmas) {
  // document作成
  const votes = new votesModel(parmas)
  // document保存
  return await votes.save()
}

exports.findOne = async function (parmas, projection, options = {}) {
  // document查询
  const q = votesModel.findOne(parmas, projection)
  if (options.lean) {
    q.lean()
  }
  return await q
}

// 查找所有
exports.find = async function (parmas, sort, projection, options = {}) {
  // document查询
  const q = votesModel.find(parmas, projection).sort(sort)
  if (options.lean) {
    q.lean()
  }
  return await q
}

// 分页查询
exports.findPage = async function (
  parmas,
  sort,
  page,
  limit,
  projection,
  options = {},
) {
  // document查询
  const q = votesModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  if (options.lean) {
    q.lean()
  }
  const list = await q
  const total = await votesModel.countDocuments(parmas)
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
  return await votesModel.updateOne(filters, parmas)
}
exports.updateOneByVote = async function (filters, parmas, options = {}) {
  return await votesModel.updateOne(filters, parmas, options)
}
exports.updateOneOptionsPromise = async function (filters, parmas) {
  // document查询
  return votesModel.updateOne(filters, parmas)
}
// deleteMany
exports.deleteMany = async function (filters) {
  return await votesModel.deleteMany(filters)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await votesModel.deleteOne(filters)
}
