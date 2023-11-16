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
  name: {
    type: String,
  },
  filename: {
    type: String,
    required: true,
  },
  filesize: {
    type: Number,
  },
  filepath: {
    type: String,
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
  // 更新时间
  updatetime: {
    type: Date,
    default: Date.now
  },
  // 0还没压缩，1压缩成功
  status: {
    type: Number,
    default: 0
  },
});

module.exports = mongoose.model('attachments', attachments);