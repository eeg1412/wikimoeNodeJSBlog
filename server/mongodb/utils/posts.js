const postsModel = require('../models/posts');

exports.save = async function (parmas) {
  // document作成
  const posts = new postsModel(parmas);
  // document保存
  return await posts.save()
}


exports.findOne = async function (parmas, projection, options = {}) {
  // document查询
  return await postsModel.findOne(parmas, projection).populate({
    path: 'author',
    select: options.authorFilter || 'nickname _id photo cover',
    populate: {
      path: 'cover',
      select: '_id filepath height mimetype width'
    }
  }).populate('sort').populate('tags').populate('coverImages')
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
    }).populate({
      path: 'eventList',
      match: { status: 1 },
      select: '_id title eventtype',
      populate: {
        path: 'eventtype',
        select: '_id name color'
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
  let query = postsModel.find(parmas, projection)
    .populate('author', options.authorFilter || 'nickname _id photo')
    .populate('sort')
    .populate('tags')
    .populate('coverImages');

  if (projection && !projection.includes('-bangumiList')) {
    query = query.populate({
      path: 'bangumiList',
      match: { status: 1 },
      select: '_id title year season',
    });
  }

  if (projection && !projection.includes('-gameList')) {
    query = query.populate({
      path: 'gameList',
      match: { status: 1 },
      select: '_id title gamePlatform',
      populate: {
        path: 'gamePlatform',
        select: '_id name color'
      }
    });
  }

  if (projection && !projection.includes('-bookList')) {
    query = query.populate({
      path: 'bookList',
      match: { status: 1 },
      select: '_id title booktype',
      populate: {
        path: 'booktype',
        select: '_id name color'
      }
    });
  }

  if (projection && !projection.includes('-postList')) {
    query = query.populate({
      path: 'postList',
      match: { status: 1, type: 1 },
      select: 'title _id alias',
    });
  }

  if (projection && !projection.includes('-eventList')) {
    query = query.populate({
      path: 'eventList',
      match: { status: 1 },
      select: '_id title',
    });
  }

  const list = await query.sort(sort).skip((page - 1) * limit).limit(limit);
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
// updateMany
exports.updateMany = async function (filters, parmas) {
  parmas.$inc = { __v: 1, ...parmas.$inc }
  // document查询
  return await postsModel.updateMany(filters, parmas);
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await postsModel.deleteOne(filters);
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await postsModel.deleteMany(filters);
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

// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await postsModel.deleteMany(filters);
}