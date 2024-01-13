var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var referrers = new Schema({
  // 来源
  referrer: {
    type: String,
    required: true,
  },
  // 来源类型
  referrerType: {
    type: String,
    required: true,
  },
  expireAt: { type: Date, expires: 31968000, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('referrers', referrers);