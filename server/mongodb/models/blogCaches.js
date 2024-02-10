var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var blogCaches = new Schema({
  key: {
    type: String,
  },
  value: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date,
    default: Date.now
  },

}, { capped: 31457280 });

module.exports = mongoose.model('blogcaches', blogCaches);