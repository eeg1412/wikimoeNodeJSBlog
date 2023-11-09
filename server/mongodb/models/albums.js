var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var albums = new Schema({
  name: {
    type: String,
    required: true,
    // 唯一
    unique: true
  },
  // 相册下的文件数量
  count: {
    type: Number,
    default: 0
  },
  // 相册的更新时间
  updatetime: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('albums', albums);