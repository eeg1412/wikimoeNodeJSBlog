var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var sidebars = new Schema(
  {
    // 侧边栏名称
    title: { type: String },
    // 侧边栏内容
    content: { type: String },
    // 计数
    count: { type: Number, default: 1 },
    // 1:自定义 3:最新评论 4:随机标签 5:随机文章 6:相册 8:分类 9:归档 10:谷歌广告
    type: {
      type: Number,
      // 必填
      required: true,
      index: true
    },
    // 排序
    taxis: { type: Number, default: 0, index: true },
    // 0:不可见 1:可见
    status: { type: Number, default: 0, index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('sidebars', sidebars)
