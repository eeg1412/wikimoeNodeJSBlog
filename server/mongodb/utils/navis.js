const navisModel = require('../models/navis');

exports.save = async function (parmas) {
  // document作成
  const navis = new navisModel(parmas);
  // document保存
  return await navis.save()
}


exports.findOne = async function (parmas) {
  // document查询
  return await navisModel.findOne(parmas);
}

// 查找所有
exports.find = async function (parmas, sort) {
  // document查询
  return await navisModel.find(parmas).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit) {
  // document查询
  const list = await navisModel.find(parmas).sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await navisModel.countDocuments(parmas);
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
  return await navisModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await navisModel.deleteOne(filters);
}