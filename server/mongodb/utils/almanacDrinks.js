const almanacDrinksModel = require('../models/almanacDrinks')

exports.save = async function (parmas) {
  const almanacDrinks = new almanacDrinksModel(parmas)
  return await almanacDrinks.save()
}

exports.findOne = async function (parmas, projection) {
  return await almanacDrinksModel.findOne(parmas, projection)
}

exports.find = async function (parmas, sort, projection, options = {}) {
  const q = almanacDrinksModel.find(parmas, projection).sort(sort)
  if (options.lean) {
    q.lean()
  }
  return await q
}

exports.findPage = async function (parmas, sort, page = 1, limit = 9999, projection) {
  const list = await almanacDrinksModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await almanacDrinksModel.countDocuments(parmas)
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
  return await almanacDrinksModel.updateOne(filters, parmas)
}

exports.deleteOne = async function (filters) {
  return await almanacDrinksModel.deleteOne(filters)
}

exports.deleteMany = async function (filters) {
  return await almanacDrinksModel.deleteMany(filters)
}
