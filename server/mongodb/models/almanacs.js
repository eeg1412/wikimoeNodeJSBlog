var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var almanacs = new Schema(
  {
    // 项目名称（可包含占位符如%v, %t, %l）
    name: { type: String, required: true },
    // 宜的说明
    good: { type: String, default: '' },
    // 不宜的说明
    bad: { type: String, default: '' },
    // 是否仅周末显示
    weekend: { type: Boolean, default: false },
    // 生效日期（YYYYMMDD格式，如20240101，表示从该日期开始生效，必填）
    effectiveDate: { type: Number, required: true, index: true },
    // 排序
    taxis: { type: Number, default: 0, index: true },
    // 0:不可见 1:可见
    status: { type: Number, default: 1, index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('almanacs', almanacs)
