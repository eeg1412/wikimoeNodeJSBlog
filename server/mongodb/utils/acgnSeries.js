const acgnSeriesModel = require('../models/acgnSeries')

exports.save = async function (parmas) {
  const acgnSeries = new acgnSeriesModel(parmas)
  return await acgnSeries.save()
}

exports.findOne = async function (parmas, projection) {
  return await acgnSeriesModel.findOne(parmas, projection)
}

exports.find = async function (parmas, sort, projection) {
  return await acgnSeriesModel.find(parmas, projection).sort(sort)
}

exports.findPage = async function (
  parmas,
  sort,
  page,
  limit,
  projection,
  options = {}
) {
  const q = acgnSeriesModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  if (options.lean) {
    q.lean()
  }
  const list = await q
  const total = await acgnSeriesModel.countDocuments(parmas)
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
  return await acgnSeriesModel.updateOne(filters, parmas)
}

exports.deleteOne = async function (filters) {
  return await acgnSeriesModel.deleteOne(filters)
}

exports.deleteMany = async function (filters) {
  return await acgnSeriesModel.deleteMany(filters)
}

exports.aggregate = async function (parmas) {
  return await acgnSeriesModel.aggregate(parmas)
}

exports.count = async function (filters) {
  return await acgnSeriesModel.countDocuments(filters)
}
