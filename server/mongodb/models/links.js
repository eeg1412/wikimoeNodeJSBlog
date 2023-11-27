var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var links = new Schema({
}, { timestamps: true });

module.exports = mongoose.model('links', links);