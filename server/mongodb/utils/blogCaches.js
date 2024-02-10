const blogCachesModel = require('../models/blogCaches');

exports.save = async function (parmas) {
  // document作成
  const blogCaches = new blogCachesModel(parmas);
  // document保存
  return await blogCaches.save()
}


exports.findOne = async function (parmas, projection) {
  // document查询
  return await blogCachesModel.findOne(parmas, projection);
}

// 删除全部
exports.deleteMany = async function (parmas) {
  // document查询
  return await blogCachesModel.deleteMany(parmas);
}

// count
exports.count = async function (parmas) {
  // document查询
  return await blogCachesModel.countDocuments(parmas);
}