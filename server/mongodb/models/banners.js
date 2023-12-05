var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var banners = new Schema({
  // banner名称
  title: { type: String },
  // 排序
  taxis: { type: Number, default: 0 },
  // banner图片
  img: { type: String },
  // 0:不可见 1:可见
  status: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('banners', banners);