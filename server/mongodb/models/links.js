var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var links = new Schema(
  {
    // icon 图标
    icon: {
      type: String,
      default: ''
    },
    iconPath: {
      type: String,
      default: null
    },
    // sitename 网站名称字段
    sitename: {
      type: String,
      default: '',
      // 必填
      required: true
    },
    // siteurl	网站URL字段
    siteurl: {
      type: String,
      default: '',
      // 必填
      required: true
    },
    // RSS地址
    rss: {
      type: String,
      default: ''
    },
    // description	描述字段
    description: {
      type: String,
      default: ''
    },
    // taxis	排序字段
    taxis: {
      type: Number,
      default: 0,
      index: true
    },
    // status  状态字段：0不显示，1显示
    status: {
      type: Number,
      default: 1,
      index: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('links', links)
