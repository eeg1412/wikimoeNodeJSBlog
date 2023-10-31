const tagsModel = require('../models/tags');

exports.save = async function (parmas) {
  // document作成
  const tags = new tagsModel(parmas);
  // document保存
  return await tags.save()
}


exports.findOne = async function (parmas) {
  // document查询
  return await tagsModel.findOne(parmas);
}

// 查找所有
exports.find = async function (parmas, sort) {
  // document查询
  return await tagsModel.find(parmas).sort(sort);
}

exports.updateOne = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1 }
  return await tagsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await tagsModel.deleteOne(filters);
}