const linksModel = require('../models/links');

exports.save = async function (parmas) {
  // document作成
  const links = new linksModel(parmas);
  // document保存
  return await links.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await linksModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await linksModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await linksModel.find(parmas, projection).sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await linksModel.countDocuments(parmas);
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
  return await linksModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await linksModel.deleteOne(filters);
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await linksModel.deleteMany(filters);
}