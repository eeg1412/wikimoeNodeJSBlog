const moviesModel = require('../models/movies');

exports.save = async function (parmas) {
  // document作成
  const movies = new moviesModel(parmas);
  // document保存
  return await movies.save()
}


exports.findOne = async function (parmas, projection, options = {}) {
  // document查询
  const q = moviesModel.findOne(parmas, projection);
  if (options.lean) {
    q.lean();
  }
  return await q;
}

// 查找所有
exports.find = async function (parmas, sort, projection, options = {}) {
  // document查询
  const q = moviesModel.find(parmas, projection).sort(sort);
  if (options.lean) {
    q.lean();
  }
  return await q;
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection, options = {}) {
  // document查询
  const q = moviesModel.find(parmas, projection).sort(sort).skip((page - 1) * limit).limit(limit);
  if (options.lean) {
    q.lean();
  }
  const list = await q;
  const total = await moviesModel.countDocuments(parmas);
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
  return await moviesModel.updateOne(filters, parmas);
}
// deleteMany
exports.deleteMany = async function (filters) {
  return await moviesModel.deleteMany(filters);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await moviesModel.deleteOne(filters);
}