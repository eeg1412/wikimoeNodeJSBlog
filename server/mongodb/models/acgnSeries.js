var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var acgnSeries = new Schema(
  {
    // 名称
    name: {
      type: String,
      required: true,
      index: true
    },
    // 别名
    alias: {
      type: [String],
      default: [],
      index: true
    },
    // 简介
    summary: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('acgnSeries', acgnSeries)
