const tagsModel = require('../models/tags');

exports.save = async function (parmas) {
  // document作成
  const tags = new tagsModel(parmas);
  // document保存
  return await tags.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await tagsModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await tagsModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await tagsModel.find(parmas, projection).sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await tagsModel.countDocuments(parmas);
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
  return await tagsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await tagsModel.deleteOne(filters);
}