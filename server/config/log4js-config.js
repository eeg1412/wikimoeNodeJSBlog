const path = require('path')

// ログ出力設定
module.exports = {
    appenders: {
        consoleLog: {
            type: 'console',
        },
        systemMainLogFile: {
            type: 'dateFile',
            filename: 'log/system/info/info.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
        },
        systemMainErrorLogFile: {
            type: 'dateFile',
            filename: 'log/system/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
        },
        systemMainLog: {
            type: 'logLevelFilter',
            appender: 'systemMainLogFile',
            level: 'INFO',
            maxLevel: 'WARN'
        },
        systemMainErrorLog: {
            type: 'logLevelFilter',
            appender: 'systemMainErrorLogFile',
            level: 'ERROR',
        },
        accessLogFile: {
            type: 'dateFile',
            filename: 'log/access/info/info.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
        },
        accessErrorLogFile: {
            type: 'dateFile',
            filename: 'log/access/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
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
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
        },
        userApiErrorLogFile: {
            type: 'dateFile',
            filename: 'log/user/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
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
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
        },
        adminApiErrorLogFile: {
            type: 'dateFile',
            filename: 'log/admin/error/error.log',
            pattern: 'yyyy-MM-dd',
            keepFileExt: true,
            alwaysIncludePattern: true,
            numBackups: 30,
            compress: true
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
        systemMain: {
            appenders: ['consoleLog', 'systemMainLog', 'systemMainErrorLog'],
            level: 'ALL'
        },
    },
}
