var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var gamePlatforms = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('gamePlatforms', gamePlatforms)
