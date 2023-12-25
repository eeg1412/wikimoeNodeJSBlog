const attachmentsModel = require('../models/attachments');

exports.save = async function (parmas) {
  // document作成
  const attachments = new attachmentsModel(parmas);
  // document保存
  return await attachments.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await attachmentsModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await attachmentsModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await attachmentsModel.find(parmas, projection).sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await attachmentsModel.countDocuments(parmas);
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

  return await attachmentsModel.updateOne(filters, parmas);
}
// 更新多个
exports.updateMany = async function (filters, parmas) {
  // document查询
  parmas.$inc = { __v: 1, ...parmas.$inc }

  return await attachmentsModel.updateMany(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await attachmentsModel.deleteOne(filters);
}

// 查询总数
exports.count = async function (parmas) {
  // document查询
  return await attachmentsModel.countDocuments(parmas);
}