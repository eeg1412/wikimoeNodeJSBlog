var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var sorts = new Schema({
  sortname: {
    type: String,
  },
  // alias 别名
  alias: {
    type: String,
  },
  // taxis 排序
  taxis: {
    type: Number,
    default: 0
  },
  // 父级分类
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'sorts'
  },
  // description 描述
  description: {
    type: String,
  },
  // template 模板
  template: {
    type: String,
  },
});

module.exports = mongoose.model('sorts', sorts);