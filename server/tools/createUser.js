require('dotenv').config()
// envType: 本番：prod 开发：dev
// const envType = process.argv[3] || 'dev'
// dotenv.config({ path: `./${envType}.env` })
const db = require('../mongodb/index')
const userUtils = require('../mongodb/utils/users')
const chalk = require('chalk')
const { Select, Form } = require('enquirer')
const utils = require('../utils/utils')
let hasAdmin = false

const checkAdmin = async (username, nickname, role) => {
    console.log('checking...')
    const params = []
    if (username) {
        params.push({ username: username })
    }
    if (nickname) {
        params.push({ nickname: nickname })
    }
    if (role) {
        params.push({ role: role })
    }
    const res = await userUtils.findOne({ $or: params })

    return res
}


const creatAdmin = async () => {
    const prompt = new Form({
        name: 'username',
        message: hasAdmin ? '创建管理员:' : '创建博客站长:',
        choices: [
            { name: 'username', message: '用户名' },
            { name: 'nickname', message: '昵称' },
            { name: 'password', message: '密码' },
        ],
        validate: async (value) => {
            console.log(value)
            let { username, password, nickname } = value
            if (!username) {
                return '请输入用户名'
            }
            if (!password) {
                return '请输入密码'
            }
            // 管理账号小写
            username = username.toLowerCase()
            const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{4,}$/
            if (!passwordReg.test(password)) {
                return '密码必须4位以上且包含大小写和数字'
            }
            const userNameReg = /^[a-zA-Z0-9]+$/
            if (!userNameReg.test(username)) {
                return '用户名仅支持半角英文和数字'
            }
            // 校验用户名是否存在
            const userRes = await checkAdmin(username)
            if (userRes) {
                return '该用户名已存在'
            }
            // 校验昵称是否存在
            const nicknameRes = await checkAdmin(null, nickname)
            if (nicknameRes) {
                return '该昵称已存在'
            }

            return true
        }
    })
    const res = await prompt.run()
    const username = res.username.toLowerCase()
    const params = {
        username: username,
        password: utils.creatBcryptStr(res.password),
        nickname: res.nickname,
        role: hasAdmin ? 998 : 999,
    }
    await userUtils.save(params)
    console.log(
        chalk.green(`${username}添加成功`)
    )
    process.exit(0)
}

const init = async () => {
    const res = await checkAdmin(null, null, 999)
    if (res) {
        console.log(
            chalk.green('站长账号已存在，将创建普通管理员账号')
        )
        hasAdmin = true
    }
    creatAdmin()
}

db.once('open', () => {
    init()
})
