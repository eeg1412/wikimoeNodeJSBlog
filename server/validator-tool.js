const validator = require('validator')

// 获取命令行参数
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('用法: node validator-tool.js <方法名> <值> [额外参数...]')
  console.log('例如: node validator-tool.js isEmail test@example.com')
  console.log('例如: node validator-tool.js isURL http://example.com')
  console.log(
    '支持的方法: isEmail, isURL, isIP, isUUID, isMobilePhone, 等validator.js的所有方法'
  )
  process.exit(1)
}

const methodName = args[0]
const value = args[1]
const extraArgs = args.slice(2)

// 检查方法是否存在
if (typeof validator[methodName] !== 'function') {
  console.log(`错误: 方法 '${methodName}' 不存在于validator.js中`)
  process.exit(1)
}

try {
  // 调用validator方法
  const result = validator[methodName](value, ...extraArgs)
  console.log(
    `validator.${methodName}('${value}'${
      extraArgs.length ? ', ' + extraArgs.join(', ') : ''
    }) => ${result}`
  )
} catch (error) {
  console.log(`错误: ${error.message}`)
  process.exit(1)
}
