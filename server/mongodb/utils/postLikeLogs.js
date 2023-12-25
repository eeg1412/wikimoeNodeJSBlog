const postLikeLogsModel = require('../models/postLikeLogs');

exports.save = async function (parmas) {
  // document作成
  const postLikeLogs = new postLikeLogsModel(parmas);
  // document保存
  return await postLikeLogs.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await postLikeLogsModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await postLikeLogsModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await postLikeLogsModel.find(parmas, projection).populate('post', 'title _id excerpt').sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await postLikeLogsModel.countDocuments(parmas);
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
  return await postLikeLogsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await postLikeLogsModel.deleteOne(filters);
}
// findOneAndUpdate
exports.findOneAndUpdate = async function (filters, parmas, options) {
  // document查询
  return await postLikeLogsModel.findOneAndUpdate(filters, parmas, options);
}