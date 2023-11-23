var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var comments = new Schema({
  // 文章id
  post: {
    type: Schema.Types.ObjectId,
    ref: 'posts'
  },
  // 父评论id
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'comments'
  },
  // 评论日期
  date: {
    type: Date,
    default: Date.now
  },
  // 评论内容,对应emlog的comment
  content: {
    type: String,
    default: ''
  },
  // user
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  // 是否置顶
  top: {
    type: Boolean,
    default: false
  },
  // 评论者昵称,对应emlog的poster
  nickname: {
    type: String,
    default: ''
  },
  // 评论者邮箱
  email: {
    type: String,
    default: ''
  },
  // 评论者网址
  url: {
    type: String,
    default: ''
  },
  // 评论者ip
  ip: {
    type: String,
    default: ''
  },
  ipInfo: {
    type: Object,
    default: {}
  },
  // 评论状态,0待审核,1已审核,2未通过,查询评论时注意父级评论的状态
  status: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('comments', comments);