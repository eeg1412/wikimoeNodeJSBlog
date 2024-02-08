var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var postLikeLogs = new Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'posts',
    required: true,
    index: true
  },
  // 操作者的uuid
  uuid: {
    type: String,
    required: true,
  },
  // 点赞还是取消点赞
  like: {
    type: Boolean,
    required: true,
  },
  // date
  date: {
    type: Date,
    expires: 31968000,
    default: Date.now
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
  deviceInfo: {
    type: Object,
    default: {}
  },
}, { timestamps: true });

module.exports = mongoose.model('postLikeLogs', postLikeLogs);