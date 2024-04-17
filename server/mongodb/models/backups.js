var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var backups = new Schema({
  // 备份名称
  name: {
    type: String,
    required: true
  },
  // 备份类型, 1: 备份，2: 还原
  type: {
    type: Number,
    required: true
  },
  // 备份文件名
  filename: {
    type: String,
    default: ''
  },
  // 备份文件状态，0: 备份中，1: 未删除, 2: 已删除
  fileStatus: {
    type: Number,
    required: true,
    default: 0
  },
  // 备份状态，0: 备份中/还原中,1: 成功，2: 失败
  status: {
    type: Number,
    required: true,
    default: 0
  },
  // 原因
  reason: {
    type: String,
    default: ''
  },
  // 备份备注
  remark: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('backups', backups);