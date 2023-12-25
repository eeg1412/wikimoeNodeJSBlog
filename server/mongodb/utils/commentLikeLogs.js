const commentLikeLogsModel = require('../models/commentLikeLogs');

exports.save = async function (parmas) {
  // document作成
  const commentLikeLogs = new commentLikeLogsModel(parmas);
  // document保存
  return await commentLikeLogs.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await commentLikeLogsModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await commentLikeLogsModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await commentLikeLogsModel.find(parmas, projection).populate('post', 'title _id excerpt').sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await commentLikeLogsModel.countDocuments(parmas);
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
  return await commentLikeLogsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await commentLikeLogsModel.deleteOne(filters);
}
// findOneAndUpdate
exports.findOneAndUpdate = async function (filters, parmas, options) {
  // document查询
  return await commentLikeLogsModel.findOneAndUpdate(filters, parmas, options);
}