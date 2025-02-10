var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var tags = new Schema({
  tagname: {
    type: String,
    required: true,
  },
  // 公开的文章数量
  publicPost: {
    type: Number,
    default: 0,
    index: true
  },
  // 最后一次使用时间
  lastusetime: {
    type: Date,
    default: Date.now
  },
}, { timestamps: true });

module.exports = mongoose.model('tags', tags);