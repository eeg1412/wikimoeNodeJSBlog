const chalk = require('chalk')
// 将console 改写成chalk的颜色输出
const log = console.log
console.log = function () {
  let args = Array.prototype.slice.call(arguments)
  args = args.map((arg) => {
    if (typeof arg === 'string') {
      return chalk.white(arg)
    } else {
      return arg
    }
  })
  log.apply(console, args)
}
// info
console.info = function () {
  let args = Array.prototype.slice.call(arguments)
  args = args.map((arg) => {
    if (typeof arg === 'string') {
      return chalk.green(arg)
    } else {
      return arg
    }
  })
  log.apply(console, args)
}
// warn
console.warn = function () {
  let args = Array.prototype.slice.call(arguments)
  args = args.map((arg) => {
    if (typeof arg === 'string') {
      return chalk.yellow(arg)
    } else {
      return arg
    }
  })
  log.apply(console, args)
}
// error
console.error = function () {
  let args = Array.prototype.slice.call(arguments)
  args = args.map((arg) => {
    if (typeof arg === 'string') {
      return chalk.red(arg)
    } else {
      return arg
    }
  })
  log.apply(console, args)
}
