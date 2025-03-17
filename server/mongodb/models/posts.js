var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var posts = new Schema({
  //   - title	标题字段
  // - date	日期字段
  // - content	内容字段
  // - excerpt	摘要字段
  // - alias	别名字段
  // - author	作者字段
  // - sort	分类
  // - type	类型：1blog,2tweet,3page
  // - tags	标签字段[]
  // - views	查看次数字段
  // - comnum	评论次数字段
  // - top	是否置顶字段
  // - sortop	是否排序置顶字段
  // - status	状态字段：0草稿，1发布，99回收站
  // - allowRemark	是否允许评论字段
  // - template	模板字段
  // - code	文章插入的Code字段
  // - coverImages  博客时是封面图片字段，页面时是页面图片字段

  title: {
    type: String,
    default: '',
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastChangDate: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    default: ''
  },
  excerpt: {
    type: String,
    default: ''
  },
  alias: {
    type: String,
    default: null,
    index: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    index: true
  },
  sort: {
    type: Schema.Types.ObjectId,
    ref: 'sorts',
    default: null,
    index: true
  },
  // 1blog,2tweet,3page
  type: {
    type: Number,
    index: true
  },
  tags: [{ type: Schema.ObjectId, ref: 'tags', index: true }],
  views: {
    type: Number,
    default: 0,
    index: true
  },
  comnum: {
    type: Number,
    default: 0,
    index: true
  },
  likes: {
    type: Number,
    default: 0,
    index: true
  },
  top: {
    type: Boolean,
    default: false,
    index: true
  },
  sortop: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: Number,
    default: 0,
    index: true
  },
  allowRemark: {
    type: Boolean,
    default: true
  },
  template: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  },
  editorVersion: {
    type: Number,
    default: 5
  },
  client__v: {
    type: Number,
    default: 0
  },
  coverImages: [{ type: Schema.ObjectId, ref: 'attachments' }],
  // 仅用于详情页下方的推荐内容，可能是扩展阅读或相关作品推荐。
  bangumiList: [{ type: Schema.ObjectId, ref: 'bangumis', default: [] }],
  movieList: [{ type: Schema.ObjectId, ref: 'movies', default: [] }],
  gameList: [{ type: Schema.ObjectId, ref: 'games', default: [] }],
  bookList: [{ type: Schema.ObjectId, ref: 'books', default: [] }],
  postList: [{ type: Schema.ObjectId, ref: 'posts', default: [] }],
  eventList: [{ type: Schema.ObjectId, ref: 'events', default: [] }],
  voteList: [{ type: Schema.ObjectId, ref: 'votes', default: [] }],
  // 用于文章列表页和详情页的文章内容里，表示与文章本身强相关的内容。
  contentBangumiList: [{ type: Schema.ObjectId, ref: 'bangumis', default: [] }],
  contentMovieList: [{ type: Schema.ObjectId, ref: 'movies', default: [] }],
  contentGameList: [{ type: Schema.ObjectId, ref: 'games', default: [] }],
  contentBookList: [{ type: Schema.ObjectId, ref: 'books', default: [] }],
  contentPostList: [{ type: Schema.ObjectId, ref: 'posts', default: [] }],
  contentEventList: [{ type: Schema.ObjectId, ref: 'events', default: [] }],
  contentVoteList: [{ type: Schema.ObjectId, ref: 'votes', default: [] }],
}, { timestamps: true });

module.exports = mongoose.model('posts', posts);