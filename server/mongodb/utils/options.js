const optionsModel = require('../models/options');

exports.save = async function (parmas) {
  // document作成
  const options = new optionsModel(parmas);
  // document保存
  return await options.save()
}


exports.findOne = async function (parmas) {
  // document查询
  return await optionsModel.findOne(parmas);
}

// 查找所有
exports.find = async function (parmas, sort) {
  // document查询
  return await optionsModel.find(parmas).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit) {
  // document查询
  const list = await optionsModel.find(parmas).sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await optionsModel.countDocuments(parmas);
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
  return await optionsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await optionsModel.deleteOne(filters);
}