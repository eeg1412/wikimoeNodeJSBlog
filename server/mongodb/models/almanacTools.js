const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Schema for almanac tools (like Eclipse, Linux, etc.)
const almanacTools = new Schema(
  {
    // tool name
    name: { type: String, required: true },
    // sorting order
    taxis: { type: Number, default: 0, index: true },
    // 0:invisible 1:visible
    status: { type: Number, default: 1, index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('almanacTools', almanacTools)
