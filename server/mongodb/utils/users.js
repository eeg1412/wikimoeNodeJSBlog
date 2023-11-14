const usersModel = require('../models/users');

exports.save = async function (parmas) {
    // document作成
    const users = new usersModel(parmas);
    // document保存
    return await users.save()
}


exports.findOne = async function (parmas) {
    // document查询
    return await usersModel.findOne(parmas);
}

exports.updateOne = async function (filters, parmas) {
    // document查询
    parmas.$inc = { __v: 1, ...parmas.$inc }
    return await usersModel.updateOne(filters, parmas);
}