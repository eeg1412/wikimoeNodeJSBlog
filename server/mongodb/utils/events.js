const eventsModel = require('../models/events');

exports.save = async function (parmas) {
  // document作成
  const events = new eventsModel(parmas);
  // document保存
  return await events.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await eventsModel.findOne(parmas, projection).populate('eventtype', '_id name color');
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await eventsModel.find(parmas, projection).populate('eventtype', '_id name color').sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection) {
  // document查询
  const list = await eventsModel.find(parmas, projection).populate('eventtype', '_id name color').sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await eventsModel.countDocuments(parmas);
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
  return await eventsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await eventsModel.deleteOne(filters);
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await eventsModel.deleteMany(filters);
}
// count
exports.count = async function (filters) {
  // document查询
  return await eventsModel.countDocuments(filters);
}