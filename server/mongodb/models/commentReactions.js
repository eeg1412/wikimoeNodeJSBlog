var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var commentReactions = new Schema(
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
      required: true
    },
    // 反应表情
    emoji: {
      type: String,
      required: true
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
    }
  },
  { timestamps: true }
)

commentReactions.index({ comment: 1, uuid: 1 }, { unique: true })

module.exports = mongoose.model('commentReactions', commentReactions)
