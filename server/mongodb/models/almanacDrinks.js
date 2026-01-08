const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Schema for almanac drinks (like 水, 茶, 咖啡, etc.)
const almanacDrinks = new Schema(
  {
    // drink name
    name: { type: String, required: true },
    // sorting order
    taxis: { type: Number, default: 0, index: true },
    // 0:invisible 1:visible
    status: { type: Number, default: 1, index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('almanacDrinks', almanacDrinks)
