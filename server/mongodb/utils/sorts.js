const sortsModel = require('../models/sorts');

exports.save = async function (parmas) {
  // document作成
  const sorts = new sortsModel(parmas);
  // document保存
  return await sorts.save()
}


exports.findOne = async function (parmas) {
  // document查询
  return await sortsModel.findOne(parmas);
}

// 查找所有
exports.find = async function (parmas, sort) {
  // document查询
  return await sortsModel.find(parmas).sort(sort);
}

exports.updateOne = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1 }
  return await sortsModel.updateOne(filters, parmas);
}