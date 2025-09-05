const mappointsModel = require('../models/mappoints')

exports.save = async function (parmas) {
  // document作成
  const mappoints = new mappointsModel(parmas)
  // document保存
  return await mappoints.save()
}

exports.findOne = async function (parmas, projection, options = {}) {
  // document查询
  const q = mappointsModel.findOne(parmas, projection)
  if (options.lean) {
    q.lean()
  }
  return await q
}

// 查找所有
exports.find = async function (parmas, sort, projection, options = {}) {
  // document查询
  const q = mappointsModel.find(parmas, projection).sort(sort)
  if (options.lean) {
    q.lean()
  }
  return await q
}

exports.findLimit = async function (parmas, sort, limit = 10, projection) {
  // document查询
  return await mappointsModel.find(parmas, projection).sort(sort).limit(limit)
}

// 分页查询
exports.findPage = async function (
  parmas,
  sort,
  page,
  limit,
  projection,
  options = {}
) {
  // document查询
  const q = mappointsModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  if (options.lean) {
    q.lean()
  }
  const list = await q
  const total = await mappointsModel.countDocuments(parmas)
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
  return await mappointsModel.updateOne(filters, parmas)
}
// deleteMany
exports.deleteMany = async function (filters) {
  return await mappointsModel.deleteMany(filters)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await mappointsModel.deleteOne(filters)
}

// 聚合
exports.aggregate = async function (pipeline) {
  return await mappointsModel.aggregate(pipeline)
}
