const chalk = require('chalk')
const userUtils = require('../../mongodb/utils/users')
const utils = require('../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

module.exports = async function (req, res, next) {
    const username = req.body.username
    const password = req.body.password
    // 是否记住密码
    const remember = req.body.remember
    // TODO: 增加一个IP？
    // 校验格式
    const params = {
        username: username,
        password: password
    }
    const rule = [
        {
            key: 'username',
            label: 'ユーザー名',
            type: null,
            required: true,
        },
        {
            key: 'password',
            label: 'パスワード',
            type: null,
            required: true,
        }
    ]
    const errors = utils.checkForm(params, rule)
    if (errors.length > 0) {
        res.status(400).json({ errors })
        return
    }
    // 校验用户名密码
    const admin = await userUtils.findOne({ username })
    if (!admin) {
        adminApiLog.warn(`admin:${username} try login but not found account`)
        res.status(400).json({
            errors: [{
                message: '用户名或密码不正确'
            }]
        })
        return
    }
    if (!utils.checkBcryptStr(password, admin.password)) {
        adminApiLog.warn(`admin:${username} password is not correct`)
        res.status(400).json({
            errors: [{
                message: '用户名或密码不正确'
            }]
        })
        return
    }
    // 登录成功
    const jwt = utils.creatJWT({
        id: admin._id,
        username: admin.username,
        role: admin.role,
        version: 1
    }, remember ? '365d' : '1d')
    adminApiLog.info(`admin:${username} login`)
    res.send({
        token: jwt
    })
}
