// 格式化时间 支持1秒前、1分钟前、1小时前、1天前，超过1天显示具体时间，支持具体时间自定义格式
export function fromNow(
  date: string | number | Date,
  fmt = 'yyyy-MM-dd hh:mm:ss'
) {
  date = new Date(date)
  const now = Date.now()
  // 如果来自未来的时间
  if (now < Number(date)) {
    return formatDate(date, fmt)
  }
  const diff = (now - Number(date)) / 1000
  if (diff < 60) {
    return `${Math.ceil(diff)}秒前`
  } else if (diff < 60 * 60) {
    return `${Math.ceil(diff / 60)}分钟前`
  } else if (diff < 60 * 60 * 24) {
    return `${Math.ceil(diff / 60 / 60)}小时前`
  } else if (diff < 60 * 60 * 24 * 30) {
    return `${Math.ceil(diff / 60 / 60 / 24)}天前`
  } else {
    return formatDate(date, fmt)
  }
}

export function formatDate(
  date: string | number | Date,
  fmt = 'yyyy-MM-dd hh:mm:ss'
) {
  date = new Date(date)

  const o: { [key: string]: number } = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  }

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }

  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k] + ''
          : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }

  return fmt
}

// 转换数字格式，分k、m, b
export function formatNumber(num: number) {
  if (num < 1000) {
    return num
  } else if (num < 10000) {
    return Math.floor(num / 1000) + 'k'
  } else if (num < 100000000) {
    return Math.floor(num / 10000) + 'm'
  } else {
    return Math.floor(num / 100000000) + 'b'
  }
}
