var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var votelogs = new Schema({
  vote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'votes',
    required: true,
    index: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'posts',
    index: true,
    default: null
  },
  // 选项 数组
  options: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }],

  // 操作者的uuid
  uuid: {
    type: String,
    required: true,
  },
  // ip
  ip: {
    type: String,
    index: true
  },
  ipInfo: {
    type: Object,
    default: {}
  },
  deviceInfo: {
    type: Object,
    default: {}
  },
  expireAt: {
    type: Date,
    expires: 31968000,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('votelogs', votelogs);