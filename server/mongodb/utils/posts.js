const postsModel = require('../models/posts');

exports.save = async function (parmas) {
  // document作成
  const posts = new postsModel(parmas);
  // document保存
  return await posts.save()
}


exports.findOne = async function (parmas, projection, options = {}) {
  // document查询
  return await postsModel.findOne(parmas, projection).populate('author', options.authorFilter || 'nickname _id photo').populate('sort').populate('tags').populate('coverImages')
    .populate(
      {
        path: 'bangumiList',
        match: { status: 1 },
        select: '-coverFileName -coverFolder -createdAt -updatedAt',
      }
    ).populate({
      path: 'gameList',
      match: { status: 1 },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: {
        path: 'gamePlatform',
        select: '_id name color'
      }
    }).populate({
      path: 'bookList',
      match: { status: 1 },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: {
        path: 'booktype',
        select: '_id name color'
      }
    }).populate({
      path: 'postList',
      match: { status: 1, type: 1 },
      select: 'title _id coverImages alias',
      populate: {
        path: 'coverImages',
      }
    });
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await postsModel.find(parmas, projection).sort(sort);
}

// 分页查询
exports.findPage = async function (parmas, sort, page, limit, projection, options = {}) {
  // document查询
  const list = await postsModel.find(parmas, projection).populate('author', options.authorFilter || 'nickname _id photo').populate('sort').populate('tags').populate('coverImages')
    .populate(
      {
        path: 'bangumiList',
        match: { status: 1 },
        select: '_id title',
      }
    ).populate({
      path: 'gameList',
      match: { status: 1 },
      select: '_id title',
    }).populate({
      path: 'bookList',
      match: { status: 1 },
      select: '_id title',
    }).populate({
      path: 'postList',
      match: { status: 1, type: 1 },
      select: 'title _id alias',
    })
    .sort(sort).skip((page - 1) * limit).limit(limit);
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

exports.updateOne = async function (filters, parmas, isClient = false) {
  // document查询
  if (isClient) {
    parmas.$inc = { ...parmas.$inc }
  } else {
    parmas.$inc = { __v: 1, ...parmas.$inc }
  }
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

// 聚合
exports.aggregate = async function (parmas) {
  // document查询
  return await postsModel.aggregate(parmas);
}
// findOneAndUpdate
exports.findOneAndUpdate = async function (filters, parmas, options) {
  // document查询
  return await postsModel.findOneAndUpdate(filters, parmas, options);
}