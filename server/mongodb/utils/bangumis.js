const bangumisModel = require('../models/bangumis');

exports.save = async function (parmas) {
  // document作成
  const bangumis = new bangumisModel(parmas);
  // document保存
  return await bangumis.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await bangumisModel.findOne(parmas, projection);
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await bangumisModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection, options = {}) {
  // document查询
  const q = bangumisModel.find(parmas, projection).sort(sort).skip((page - 1) * limit).limit(limit);
  if (options.lean) {
    q.lean();
  }
  const list = await q;
  const total = await bangumisModel.countDocuments(parmas);
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
  return await bangumisModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await bangumisModel.deleteOne(filters);
}
// aggregate
exports.aggregate = async function (parmas) {
  // document查询
  return await bangumisModel.aggregate(parmas);
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await bangumisModel.deleteMany(filters);
}