const postsModel = require('../models/posts');

exports.save = async function (parmas) {
  // document作成
  const posts = new postsModel(parmas);
  // document保存
  return await posts.save()
}


exports.findOne = async function (parmas) {
  // document查询
  return await postsModel.findOne(parmas).populate('author', 'nickname _id photo').populate('sort').populate('tags').populate('coverImages');
}

// 查找所有
exports.find = async function (parmas, sort) {
  // document查询
  return await postsModel.find(parmas).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, filter, sort, page, limit) {
  // document查询
  const list = await postsModel.find(parmas, filter).populate('author', 'nickname _id photo').populate('sort').populate('tags').populate('coverImages').sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await postsModel.countDocuments(parmas);
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
  return await postsModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await postsModel.deleteOne(filters);
}

// 查询总数
exports.count = async function (parmas) {
  // document查询
  return await postsModel.countDocuments(parmas);
}