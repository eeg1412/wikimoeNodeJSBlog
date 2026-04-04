const stickerGroupsModel = require('../models/stickerGroups')

exports.save = async function (parmas) {
  const stickerGroup = new stickerGroupsModel(parmas)
  return await stickerGroup.save()
}

exports.findOne = async function (parmas, projection) {
  return await stickerGroupsModel.findOne(parmas, projection)
}

exports.find = async function (parmas, sort, projection, options = {}) {
  const q = stickerGroupsModel.find(parmas, projection).sort(sort)
  if (options.lean) {
    q.lean()
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
  const q = stickerGroupsModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  if (options.lean) {
    q.lean()
  }
  const list = await q
  const total = await stickerGroupsModel.countDocuments(parmas)
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
  return await stickerGroupsModel.updateOne(filters, parmas)
}

exports.deleteOne = async function (filters) {
  return await stickerGroupsModel.deleteOne(filters)
}

exports.countDocuments = async function (parmas) {
  return await stickerGroupsModel.countDocuments(parmas)
}
