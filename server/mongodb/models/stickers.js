var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var stickers = new Schema(
  {
    // 所属贴纸组
    group: {
      type: Schema.Types.ObjectId,
      ref: 'stickerGroups',
      required: true,
      index: true
    },
    // 描述
    description: {
      type: String,
      required: true
    },
    // 排序
    taxis: {
      type: Number,
      default: 0,
      index: true
    },
    // 图片宽度
    width: {
      type: Number,
      required: true
    },
    // 图片高度
    height: {
      type: Number,
      required: true
    },
    // 缩略图宽度
    thumWidth: {
      type: Number,
      required: true
    },
    // 缩略图高度
    thumHeight: {
      type: Number,
      required: true
    },
    // 是否显示 0: 不显示 1: 显示
    status: {
      type: Number,
      default: 0,
      index: true
    },
    // 图片路径
    image: {
      type: String,
      required: true
    },
    // 缩略图路径
    thumbnail: {
      type: String,
      required: true
    },
    // 图片文件夹
    imageFolder: {
      type: String,
      default: null
    },
    // 图片文件名
    imageFileName: {
      type: String,
      default: null
    },
    // 缩略图文件名
    thumbnailFileName: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('stickers', stickers)
