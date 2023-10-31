var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var tags = new Schema({
  tagname: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('tags', tags);