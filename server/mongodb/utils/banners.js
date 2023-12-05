const bannersModel = require('../models/banners');

exports.save = async function (parmas) {
  // document作成
  const banners = new bannersModel(parmas);
  // document保存
  return await banners.save()
}


exports.findOne = async function (parmas) {
  // document查询
  return await bannersModel.findOne(parmas);
}

// 查找所有
exports.find = async function (parmas, sort) {
  // document查询
  return await bannersModel.find(parmas).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit) {
  // document查询
  const list = await bannersModel.find(parmas).sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await bannersModel.countDocuments(parmas);
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
  return await bannersModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await bannersModel.deleteOne(filters);
}