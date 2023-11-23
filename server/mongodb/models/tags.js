var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var tags = new Schema({
  tagname: {
    type: String,
    required: true,
  },
  // 最后一次使用时间
  lastusetime: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('tags', tags);