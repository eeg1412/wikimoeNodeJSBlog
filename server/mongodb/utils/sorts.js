const sortsModel = require('../models/sorts');

exports.save = async function (parmas) {
  // document作成
  const sorts = new sortsModel(parmas);
  // document保存
  return await sorts.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await sortsModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await sortsModel.find(parmas, projection).sort(sort);
}

exports.updateOne = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1, ...parmas.$inc }
  return await sortsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await sortsModel.deleteOne(filters);
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await sortsModel.deleteMany(filters);
}