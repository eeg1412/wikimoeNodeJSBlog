var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var sorts = new Schema({
  sortname: {
    type: String,
    required: true,
  },
  // alias 别名
  alias: {
    type: String,
    index: true
  },
  // taxis 排序
  taxis: {
    type: Number,
    default: 0,
    index: true
  },
  // 父级分类 ObjectId 或者null
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'sorts',
    index: true
  },
  // description 描述
  description: {
    type: String,
  },
  // 公开的文章数量
  publicPost: {
    type: Number,
    default: 0,
    index: true
  },
  // template 模板
  template: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('sorts', sorts);