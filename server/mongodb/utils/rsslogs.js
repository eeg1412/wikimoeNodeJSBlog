const rsslogsModel = require('../models/rsslogs');

exports.save = async function (parmas) {
  // document作成
  const rsslogs = new rsslogsModel(parmas);
  // document保存
  return await rsslogs.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await rsslogsModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await rsslogsModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await rsslogsModel.find(parmas, projection).sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await rsslogsModel.countDocuments(parmas);
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
  return await rsslogsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await rsslogsModel.deleteOne(filters);
}

// 聚合
exports.aggregate = async function (parmas) {
  // document查询
  return await rsslogsModel.aggregate(parmas);
}