const booksModel = require('../models/books');

exports.save = async function (parmas) {
  // document作成
  const books = new booksModel(parmas);
  // document保存
  return await books.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await booksModel.findOne(parmas, projection).populate('booktype', '_id name color');
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await booksModel.find(parmas, projection).populate('booktype', '_id name color').sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection, options = {}) {
  // document查询
  const q = booksModel.find(parmas, projection).populate('booktype', '_id name color').sort(sort).skip((page - 1) * limit).limit(limit);
  if (options.lean) {
    q.lean();
  }
  const list = await q;
  const total = await booksModel.countDocuments(parmas);
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
  return await booksModel.updateOne(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await booksModel.deleteOne(filters);
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await booksModel.deleteMany(filters);
}

// count
exports.count = async function (filters) {
  // document查询
  return await booksModel.countDocuments(filters);
}