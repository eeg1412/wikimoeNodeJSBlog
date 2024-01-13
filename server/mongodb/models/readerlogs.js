var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var readerlogs = new Schema({
  // 操作者的uuid
  uuid: {
    type: String,
    required: true,
  },
  // 操作了什么
  action: {
    type: String,
    required: true,
  },
  referrer: {
    type: String,
    default: ''
  },
  isBot: {
    type: Boolean,
    default: false
  },
  botName: {
    type: String,
    default: ''
  },
  // data
  data: {
    // object
    target: {
      type: String,
      default: ''
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    content: {
      type: String,
      default: ''
    },
  },
  // ip
  ip: {
    type: String,
  },
  ipInfo: {
    type: Object,
    default: {}
  },
  deviceInfo: {
    type: Object,
    default: {}
  },
  expireAt: { type: Date, expires: 31968000, default: Date.now }
}, { timestamps: true });
// timestamps:
// createdAt
// updatedAt
module.exports = mongoose.model('readerlogs', readerlogs);