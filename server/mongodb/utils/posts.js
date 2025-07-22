const postsModel = require('../models/posts')

exports.save = async function (parmas) {
  // document作成
  const posts = new postsModel(parmas)
  // document保存
  return await posts.save()
}

exports.findOne = async function (parmas, projection, options = {}) {
  const isAdmin = options.isAdmin || false
  let matchStatus = 1
  if (isAdmin) {
    matchStatus = { $in: [0, 1] }
  }
  // document查询
  return await postsModel
    .findOne(parmas, projection)
    .populate({
      path: 'author',
      select: options.authorFilter || 'nickname _id photo cover',
      populate: {
        path: 'cover',
        select: '_id filepath height mimetype width'
      }
    })
    .populate('sort')
    .populate('tags')
    .populate('coverImages')
    .populate({
      path: 'bangumiList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt'
    })
    .populate({
      path: 'movieList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt'
    })
    .populate({
      path: 'gameList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: [
        {
          path: 'gamePlatform',
          select: '_id name color'
        },
        // screenshotAlbum
        {
          path: 'screenshotAlbum',
          select: '_id name'
        }
      ]
    })
    .populate({
      path: 'bookList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: {
        path: 'booktype',
        select: '_id name color'
      }
    })
    .populate({
      path: 'postList',
      match: { status: matchStatus, type: 1 },
      select: 'title _id coverImages alias date status',
      populate: {
        select: 'filepath thumfor width height thumWidth thumHeight mimetype',
        path: 'coverImages'
      }
    })
    .populate({
      path: 'tweetList',
      match: { status: matchStatus, type: 2 },
      select: 'title _id coverImages excerpt alias date status',
      populate: {
        select: 'filepath thumfor width height thumWidth thumHeight mimetype',
        path: 'coverImages'
      }
    })
    .populate({
      path: 'eventList',
      match: { status: matchStatus },
      select: '_id title eventtype startTime status',
      populate: {
        path: 'eventtype',
        select: '_id name color'
      }
    })
    .populate({
      path: 'voteList',
      match: { status: matchStatus },
      select: options.voteFliter || undefined
    })
    .populate({
      path: 'contentBangumiList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt'
    })
    .populate({
      path: 'contentMovieList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt'
    })
    .populate({
      path: 'contentGameList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: [
        {
          path: 'gamePlatform',
          select: '_id name color'
        },
        // screenshotAlbum
        {
          path: 'screenshotAlbum',
          select: '_id name'
        }
      ]
    })
    .populate({
      path: 'contentBookList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: {
        path: 'booktype',
        select: '_id name color'
      }
    })
    .populate({
      path: 'contentPostList',
      match: { status: matchStatus, type: 1 },
      select: 'title _id coverImages alias date status',
      populate: {
        select: 'filepath thumfor width height thumWidth thumHeight mimetype',
        path: 'coverImages'
      }
    })
    .populate({
      path: 'contentTweetList',
      match: { status: matchStatus, type: 2 },
      select: 'title _id coverImages excerpt alias date status',
      populate: {
        select: 'filepath thumfor width height thumWidth thumHeight mimetype',
        path: 'coverImages'
      }
    })
    .populate({
      path: 'contentEventList',
      match: { status: matchStatus },
      select: '_id title eventtype startTime status',
      populate: {
        path: 'eventtype',
        select: '_id name color'
      }
    })
    .populate({
      path: 'contentVoteList',
      match: { status: matchStatus },
      select: options.voteFliter || undefined
    })
}

// 查找所有
exports.find = async function (parmas, sort, projection) {
  // document查询
  return await postsModel.find(parmas, projection).sort(sort)
}
// 查询Cursor
exports.findCursor = function (parmas, sort, projection) {
  // document查询
  return postsModel.find(parmas, projection).sort(sort).cursor()
}

// 分页查询
exports.findPage = async function (
  parmas,
  sort,
  page,
  limit,
  projection,
  options = {}
) {
  const isAdmin = options.isAdmin || false
  let matchStatus = 1
  if (isAdmin) {
    matchStatus = { $in: [0, 1] }
  }
  // document查询
  let query = postsModel
    .find(parmas, projection)
    .populate('author', options.authorFilter || 'nickname _id photo')
    .populate('sort')
    .populate('tags')
    .populate('coverImages')

  if (projection && !projection.includes('-bangumiList')) {
    query = query.populate({
      path: 'bangumiList',
      match: { status: matchStatus },
      select: '_id title year season status'
    })
  }

  if (projection && !projection.includes('-movieList')) {
    query = query.populate({
      path: 'movieList',
      match: { status: matchStatus },
      select: '_id title year month day status'
    })
  }

  if (projection && !projection.includes('-gameList')) {
    query = query.populate({
      path: 'gameList',
      match: { status: matchStatus },
      select: '_id title gamePlatform status',
      populate: {
        path: 'gamePlatform',
        select: '_id name color'
      }
    })
  }

  if (projection && !projection.includes('-bookList')) {
    query = query.populate({
      path: 'bookList',
      match: { status: matchStatus },
      select: '_id title booktype status',
      populate: {
        path: 'booktype',
        select: '_id name color'
      }
    })
  }

  if (projection && !projection.includes('-postList')) {
    query = query.populate({
      path: 'postList',
      match: { status: matchStatus, type: 1 },
      select: 'title _id alias date status'
    })
  }

  if (projection && !projection.includes('-tweetList')) {
    query = query.populate({
      path: 'tweetList',
      match: { status: matchStatus, type: 2 },
      select: 'title _id excerpt alias date status'
    })
  }

  if (projection && !projection.includes('-eventList')) {
    query = query.populate({
      path: 'eventList',
      match: { status: matchStatus },
      select: '_id title startTime status'
    })
  }

  if (projection && !projection.includes('-voteList')) {
    query = query.populate({
      path: 'voteList',
      match: { status: matchStatus },
      select: options.voteFliter || undefined
    })
  }

  if (projection && !projection.includes('-contentBangumiList')) {
    query = query.populate({
      path: 'contentBangumiList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt'
    })
  }

  if (projection && !projection.includes('-contentMovieList')) {
    query = query.populate({
      path: 'contentMovieList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt'
    })
  }

  if (projection && !projection.includes('-contentGameList')) {
    query = query.populate({
      path: 'contentGameList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: [
        {
          path: 'gamePlatform',
          select: '_id name color'
        },
        // screenshotAlbum
        {
          path: 'screenshotAlbum',
          select: '_id name'
        }
      ]
    })
  }

  if (projection && !projection.includes('-contentBookList')) {
    query = query.populate({
      path: 'contentBookList',
      match: { status: matchStatus },
      select: '-coverFileName -coverFolder -createdAt -updatedAt',
      populate: {
        path: 'booktype',
        select: '_id name color'
      }
    })
  }

  if (projection && !projection.includes('-contentPostList')) {
    query = query.populate({
      path: 'contentPostList',
      match: { status: matchStatus, type: 1 },
      select: 'title _id coverImages alias date status',
      populate: {
        select: 'filepath thumfor width height thumWidth thumHeight mimetype',
        path: 'coverImages'
      }
    })
  }

  if (projection && !projection.includes('-contentTweetList')) {
    query = query.populate({
      path: 'contentTweetList',
      match: { status: matchStatus, type: 2 },
      select: 'title _id coverImages excerpt alias date status',
      populate: {
        select: 'filepath thumfor width height thumWidth thumHeight mimetype',
        path: 'coverImages'
      }
    })
  }

  if (projection && !projection.includes('-contentEventList')) {
    query = query.populate({
      path: 'contentEventList',
      match: { status: matchStatus },
      select: '_id title eventtype startTime status',
      populate: {
        path: 'eventtype',
        select: '_id name color'
      }
    })
  }

  if (projection && !projection.includes('-contentVoteList')) {
    query = query.populate({
      path: 'contentVoteList',
      match: { status: matchStatus },
      select: options.voteFliter || undefined
    })
  }

  const list = await query
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
  const total = await postsModel.countDocuments(parmas)
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
  return await postsModel.updateOne(filters, parmas)
}
// updateMany
exports.updateMany = async function (filters, parmas) {
  parmas.$inc = { __v: 1, ...parmas.$inc }
  // document查询
  return await postsModel.updateMany(filters, parmas)
}
// 删除
exports.deleteOne = async function (filters) {
  // document查询
  return await postsModel.deleteOne(filters)
}
// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await postsModel.deleteMany(filters)
}

// 查询总数
exports.count = async function (parmas) {
  // document查询
  return await postsModel.countDocuments(parmas)
}

// 聚合
exports.aggregate = async function (parmas) {
  // document查询
  return await postsModel.aggregate(parmas)
}
// findOneAndUpdate
exports.findOneAndUpdate = async function (filters, parmas, options) {
  // document查询
  return await postsModel.findOneAndUpdate(filters, parmas, options)
}

// deleteMany
exports.deleteMany = async function (filters) {
  // document查询
  return await postsModel.deleteMany(filters)
}
