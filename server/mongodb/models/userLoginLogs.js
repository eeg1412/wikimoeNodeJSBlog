var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var userLoginLogs = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: true
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
    // 登录成功
    success: {
      type: Boolean,
      required: true,
      index: true
    },
    msg: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('userLoginLogs', userLoginLogs)
