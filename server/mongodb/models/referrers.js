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
}, { capped: 15728640, timestamps: true });

module.exports = mongoose.model('referrers', referrers);