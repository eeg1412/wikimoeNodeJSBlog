var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var commentLikeLogs = new Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comments',
      required: true,
      index: true
    },
    // 操作者的uuid
    uuid: {
      type: String,
      required: true,
      index: true
    },
    // 点赞还是取消点赞
    like: {
      type: Boolean,
      required: true,
      index: true
    },
    // date
    date: {
      type: Date,
      expires: 31968000,
      default: Date.now,
      index: true
    },
    // 评论者ip
    ip: {
      type: String,
      default: '',
      index: true
    },
    ipInfo: {
      type: Object,
      default: {}
    },
    deviceInfo: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('commentLikeLogs', commentLikeLogs)
