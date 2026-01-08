const almanacToolsModel = require('../models/almanacTools')

exports.save = async function (parmas) {
  const almanacTools = new almanacToolsModel(parmas)
  return await almanacTools.save()
}

exports.findOne = async function (parmas, projection) {
  return await almanacToolsModel.findOne(parmas, projection)
}

exports.find = async function (parmas, sort, projection, options = {}) {
  const q = almanacToolsModel.find(parmas, projection).sort(sort)
  if (options.lean) {
    q.lean()
  }
  return await q
}

exports.findPage = async function (parmas, sort, page = 1, limit = 9999, projection) {
  const list = await almanacToolsModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await almanacToolsModel.countDocuments(parmas)
  if (!list || total === undefined) {
    throw new Error('查询失败')
  }
  return {
    list,
    total
  }
}

exports.updateOne = async function (filters, parmas) {
  parmas.$inc = { __v: 1, ...parmas.$inc }
  return await almanacToolsModel.updateOne(filters, parmas)
}

exports.deleteOne = async function (filters) {
  return await almanacToolsModel.deleteOne(filters)
}

exports.deleteMany = async function (filters) {
  return await almanacToolsModel.deleteMany(filters)
}
