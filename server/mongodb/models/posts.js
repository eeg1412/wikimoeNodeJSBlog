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
    default: ''
  },
  date: {
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
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  sort: {
    type: Schema.Types.ObjectId,
    ref: 'sorts',
    default: null
  },
  type: {
    type: Number,
  },
  tags: [{ type: Schema.ObjectId, ref: 'tags' }],
  views: {
    type: Number,
    default: 0
  },
  comnum: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  top: {
    type: Boolean,
    default: false
  },
  sortop: {
    type: Boolean,
    default: false
  },
  status: {
    type: Number,
    default: 0
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
  coverImages: [{ type: Schema.ObjectId, ref: 'attachments' }],
}, { timestamps: true });

module.exports = mongoose.model('posts', posts);