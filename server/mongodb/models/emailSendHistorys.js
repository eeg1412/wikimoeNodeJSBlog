var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var emailSendHistorys = new Schema({
  // 发送对象
  to: {
    type: String,
  },
  // 发送内容
  content: {
    type: String,
  },
  errInfo: {
    type: String,
  },
  // 发送状态 0: 发送失败 1: 发送成功
  status: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('emailSendHistorys', emailSendHistorys);