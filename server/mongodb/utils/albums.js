const albumsModel = require('../models/albums')

exports.save = async function (parmas) {
  // document作成
  const albums = new albumsModel(parmas)
  // document保存
  return await albums.save()
}

exports.findOne = async function (parmas, projection) {
  // document查询
  return await albumsModel.findOne(parmas, projection)
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await albumsModel.find(parmas, projection).sort(sort)
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await albumsModel
    .find(parmas, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await albumsModel.countDocuments(parmas)
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
  return await albumsModel.updateOne(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await albumsModel.deleteOne(filters)
}

// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await albumsModel.deleteMany(filters)
}
