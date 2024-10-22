const commentsModel = require('../models/comments');

exports.save = async function (parmas) {
  // document作成
  const comments = new commentsModel(parmas);
  // document保存
  return await comments.save()
}


exports.findOne = async function (parmas, projection, options = {}) {
  // document查询
  return await commentsModel.findOne(parmas, projection).populate({
    path: 'parent',
    match: { status: 1 },
    select: 'content _id status user nickname date',
    populate: {
      path: 'user',
      select: '_id nickname'
    }
  }).populate('post', 'title _id excerpt').populate('user', options.userFilter || 'nickname _id photo');
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await commentsModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection, options = {}) {
  // document查询
  const list = await commentsModel.find(parmas, projection)
    .populate({
      path: 'parent',
      match: { status: 1 },
      select: 'content _id status user nickname date',
      populate: {
        path: 'user',
        select: '_id nickname'
      }
    })
    .populate('post', options.postFilter || 'title _id excerpt alias type').populate('user', options.userFilter || 'nickname _id photo').sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await commentsModel.countDocuments(parmas);
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
  return await commentsModel.updateOne(filters, parmas);
}
// updateMany
exports.updateMany = async function (filters, parmas) {
  parmas.$inc = { __v: 1, ...parmas.$inc }
  // document查询
  return await commentsModel.updateMany(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await commentsModel.deleteOne(filters);
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await commentsModel.deleteMany(filters);
}

// 查询总数
exports.count = async function (parmas) {
  // document查询
  return await commentsModel.countDocuments(parmas);
}

// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await commentsModel.deleteMany(filters);
}