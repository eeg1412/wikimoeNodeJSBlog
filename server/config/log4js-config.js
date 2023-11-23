const path = require('path')

// ログ出力設定
module.exports = {
    appenders: {
        consoleLog: {
            type: 'console',
        },
        systemLogFile: {
            type: 'dateFile',
            filename: 'log/system/info/info.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        systemErrorLogFile: {
            type: 'dateFile',
            filename: 'log/system/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        systemLog: {
            type: 'logLevelFilter',
            appender: 'systemLogFile',
            level: 'INFO',
            maxLevel: 'WARN'
        },
        systemErrorLog: {
            type: 'logLevelFilter',
            appender: 'systemErrorLogFile',
            level: 'ERROR',
        },
        accessLogFile: {
            type: 'dateFile',
            filename: 'log/access/info/info.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        accessErrorLogFile: {
            type: 'dateFile',
            filename: 'log/access/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        accessLog: {
            type: 'logLevelFilter',
            appender: 'accessLogFile',
            level: 'INFO',
            maxLevel: 'WARN'
        },
        accessErrorLog: {
            type: 'logLevelFilter',
            appender: 'accessErrorLogFile',
            level: 'ERROR',
        },
        userApiLogFile: {
            type: 'dateFile',
            filename: 'log/user/info/info.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        userApiErrorLogFile: {
            type: 'dateFile',
            filename: 'log/user/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        userApiLog: {
            type: 'logLevelFilter',
            appender: 'userApiLogFile',
            level: 'INFO',
            maxLevel: 'WARN'
        },
        userApiErrorLog: {
            type: 'logLevelFilter',
            level: 'ERROR',
            appender: 'userApiErrorLogFile'
        },
        adminApiLogFile: {
            type: 'dateFile',
            filename: 'log/admin/info/info.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        adminApiErrorLogFile: {
            type: 'dateFile',
            filename: 'log/admin/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true
        },
        adminApiLog: {
            type: 'logLevelFilter',
            appender: 'adminApiLogFile',
            level: 'INFO',
            maxLevel: 'WARN'
        },
        adminApiErrorLog: {
            type: 'logLevelFilter',
            level: 'ERROR',
            appender: 'adminApiErrorLogFile'
        }
    },
    categories: {
        default: {
            appenders: ['consoleLog'],
            level: 'ALL'
        },
        userApi: {
            appenders: ['consoleLog', 'userApiLog', 'userApiErrorLog'],
            level: 'ALL'
        },
        adminApi: {
            appenders: ['consoleLog', 'adminApiLog', 'adminApiErrorLog'],
            level: 'ALL'
        },
        access: {
            appenders: ['consoleLog', 'accessLog', 'accessErrorLog'],
            level: 'ALL'
        },
        system: {
            appenders: ['consoleLog', 'systemLog', 'systemErrorLog'],
            level: 'ALL'
        },
    },
}
