const stickersModel = require('../models/stickers')

exports.save = async function (parmas) {
  const sticker = new stickersModel(parmas)
  return await sticker.save()
}

exports.findOne = async function (parmas, projection) {
  return await stickersModel.findOne(parmas, projection)
}

exports.find = async function (parmas, sort, projection, options = {}) {
  const q = stickersModel.find(parmas, projection).sort(sort)
  if (options.lean) {
    q.lean()
  }
  if (options.populate) {
    q.populate(options.populate)
  }
  return await q
}

exports.findPage = async function (
  parmas,
  sort,
  page,
  limit,
  projection,
  options = {}
) {
  const q = stickersModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  if (options.lean) {
    q.lean()
  }
  if (options.populate) {
    q.populate(options.populate)
  }
  const list = await q
  const total = await stickersModel.countDocuments(parmas)
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
  return await stickersModel.updateOne(filters, parmas)
}

exports.updateMany = async function (filters, parmas) {
  return await stickersModel.updateMany(filters, parmas)
}

exports.deleteOne = async function (filters) {
  return await stickersModel.deleteOne(filters)
}

exports.deleteMany = async function (filters) {
  return await stickersModel.deleteMany(filters)
}

exports.countDocuments = async function (parmas) {
  return await stickersModel.countDocuments(parmas)
}
