var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var attachments = new Schema({
  //   - filename	文件名字段
  // - filesize	文件大小字段
  // - filepath	文件路径字段
  // - addtime	添加时间字段
  // - width	图片宽度字段
  // - height	图片高度字段
  // - mimetype	MIME类型字段
  // - thumfor	缩略图标识字段
  // - 相册id	album
  filename: {
    type: String,
    required: true,
  },
  filesize: {
    type: Number,
  },
  filepath: {
    type: String,
    required: true,
  },
  addtime: {
    type: Date,
    default: Date.now
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  mimetype: {
    type: String,
  },
  thumfor: {
    type: String,
  },
  album: {
    type: Schema.Types.ObjectId,
    ref: 'albums'
  },
});

module.exports = mongoose.model('attachments', attachments);