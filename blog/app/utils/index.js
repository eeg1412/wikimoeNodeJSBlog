import emoji from '@/utils/emoji.json'

let photoSwipe = {
  open: null
}

export function setPhotoSwipe(open) {
  photoSwipe.open = open
}

export function openPhotoSwipe(
  list,
  showIndex,
  closeCallback,
  hashId,
  componentName
) {
  if (photoSwipe.open) {
    photoSwipe.open(list, showIndex, closeCallback, hashId, componentName)
  }
}

// 复用 TextEncoder 实例
let encoder = null
if (import.meta.client) {
  encoder = new TextEncoder()
}

export function getImgListHashFromImgList(imgList) {
  let hash = BigInt('0xcbf29ce484222325')
  const prime = BigInt('0x100000001b3')

  // 流式处理，逐个图片计算哈希，避免生成大字符串
  for (let i = 0; i < imgList.length; i++) {
    const img = imgList[i]
    const str = img.filepath || img.src || JSON.stringify(img)

    // 直接对每个字符串编码并哈希，不需要先拼接
    const data = encoder.encode(str)
    for (let j = 0; j < data.length; j++) {
      hash ^= BigInt(data[j])
      hash = (hash * prime) & BigInt('0xffffffffffffffff')
    }

    // 添加分隔符的哈希
    if (i < imgList.length - 1) {
      const separator = encoder.encode('|')
      for (let j = 0; j < separator.length; j++) {
        hash ^= BigInt(separator[j])
        hash = (hash * prime) & BigInt('0xffffffffffffffff')
      }
    }
  }

  return hash.toString(36)
}

// 格式化时间 支持1秒前、1分钟前、1小时前、1天前，超过1天显示具体时间，支持具体时间自定义格式
export function fromNow(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  date = new Date(date)
  const now = Date.now()
  // 如果来自未来的时间
  if (now < Number(date)) {
    return formatDate(date, fmt)
  }
  const diff = (now - Number(date)) / 1000
  if (diff <= 1) {
    return '刚刚'
  } else if (diff < 60) {
    return `${Math.floor(diff)}秒前`
  } else if (diff < 60 * 60) {
    return `${Math.floor(diff / 60)}分钟前`
  } else if (diff < 60 * 60 * 24) {
    return `${Math.floor(diff / 60 / 60)}小时前`
  } else if (diff < 60 * 60 * 24 * 30) {
    return `${Math.floor(diff / 60 / 60 / 24)}天前`
  } else {
    return formatDate(date, fmt)
  }
}

export function formatDate(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  date = new Date(date)

  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }

  const yearMatch = /(y+)/.exec(fmt)
  if (yearMatch) {
    fmt = fmt.replace(
      yearMatch[0],
      (date.getFullYear() + '').substr(4 - yearMatch[0].length)
    )
  }

  for (let k in o) {
    const match = new RegExp('(' + k + ')').exec(fmt)
    if (match) {
      fmt = fmt.replace(
        match[0],
        match[0].length === 1
          ? o[k] + ''
          : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }

  return fmt
}

// 转换数字格式，分k、m, b
export function formatNumber(num) {
  if (num < 10000) {
    return num
  } else if (num < 100000000) {
    return (num / 10000).toFixed(1) + '万'
  } else {
    return (num / 100000000).toFixed(1) + '亿'
  }
}

export const limitStr = (str, len) => {
  const strArray = Array.from(str)
  if (strArray.length > len) {
    return strArray.slice(0, len).join('') + '...'
  }
  return str
}

export const getTitleFromText = text => {
  if (!text) return ''
  const limit = 50
  let title = text
  let addPoint = false
  if (title.length > limit) {
    title = Array.from(title).slice(0, limit).join('')
    addPoint = true
  }

  // 删除最前面的换行/空白和 punctRegex 所标记的标点（包括 '.' 且后面不是数字）
  // 说明：^(?:...)+ 会匹配开头连续的空白或标点并一次性移除
  title = title.replace(/^(?:\s+|[。？?！!；;…]+|\.(?!\d))+/u, '')
  if (!title) return ''

  // 先以第一个换行符为裁切点（如果存在）
  const newlineIdx = title.search(/[\r\n]/)
  if (newlineIdx !== -1) {
    title = title.slice(0, newlineIdx)
    addPoint = false
  }

  // 标点（中文标点，或 '.' 且后面不是数字）
  const punctRegex = /[。？\?！!；;…]|\.(?!\d)/g
  // 简单的 URL 匹配（支持 http(s):// 和 www. 开头）
  const urlRegex = /\b(?:https?:\/\/|www\.)[^\s]+/gi

  // 收集所有需要跳过的区间（[start, endExclusive)）
  const ranges = []

  // 1. 找出所有 URL 区间
  let m
  while ((m = urlRegex.exec(title)) !== null) {
    ranges.push([m.index, m.index + m[0].length])
  }

  // 2. 找出书名号和各类括号的匹配区间（支持嵌套）
  const pairList = [
    ['《', '》'],
    ['(', ')'],
    ['（', '）'],
    ['[', ']'],
    ['【', '】'],
    ['{', '}'],
    ['<', '>'],
    ['「', '」']
  ]

  for (const [open, close] of pairList) {
    const stack = []
    for (let i = 0; i < title.length; i++) {
      const ch = title[i]
      if (ch === open) {
        stack.push(i)
      } else if (ch === close) {
        if (stack.length > 0) {
          const start = stack.pop()
          // endExclusive = i + 1
          ranges.push([start, i + 1])
        }
      }
    }
    // 未闭合的开符号忽略（不生成区间）
  }

  if (ranges.length > 0) {
    // 合并并排序区间，便于快速判断包含关系
    ranges.sort((a, b) => a[0] - b[0])
    const merged = []
    let cur = ranges[0].slice()
    for (let i = 1; i < ranges.length; i++) {
      const r = ranges[i]
      if (r[0] <= cur[1]) {
        // 有重叠或相邻，合并
        cur[1] = Math.max(cur[1], r[1])
      } else {
        merged.push(cur)
        cur = r.slice()
      }
    }
    merged.push(cur)

    // 辅助：检查索引是否在任一区间内
    const isInRanges = idx => {
      // 线性或二分均可；这里区间数量通常很少，线性扫描且有早停
      for (let i = 0; i < merged.length; i++) {
        const [s, e] = merged[i]
        if (idx >= s && idx < e) return true
        if (idx < s) return false // 早停
      }
      return false
    }

    // 在 title 中查找第一个不在跳过区间内的标点
    punctRegex.lastIndex = 0
    let match
    while ((match = punctRegex.exec(title)) !== null) {
      const idx = match.index
      if (!isInRanges(idx)) {
        // 找到合法的标点，裁切并返回
        title = title.slice(0, idx)
        addPoint = false
        break
      }
      // 否则继续查找下一个标点
    }
  } else {
    // 没有需要跳过的区间，直接按第一个标点裁切
    punctRegex.lastIndex = 0
    const m2 = punctRegex.exec(title)
    if (m2) {
      title = title.slice(0, m2.index)
      addPoint = false
    }
  }

  if (addPoint) {
    title = title + '...'
  }

  return title
}

// 生成uuid
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // eslint-disable-next-line no-mixed-operators
    const r = (Math.random() * 16) | 0
    // eslint-disable-next-line no-mixed-operators, eqeqeq
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
// 检查uuid是否格式是否合法
export const checkUuidFormat = uuid => {
  return /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
    uuid
  )
}
// 检查本地是否存在uuid，没有则生成
export const checkUuid = () => {
  let storedUuid = localStorage.getItem('uuid')
  if (!storedUuid || !checkUuidFormat(storedUuid)) {
    storedUuid = uuid()
    localStorage.setItem('uuid', storedUuid)
  }
  return storedUuid
}

export const isObjectId = value => {
  return value.match(/^[0-9a-fA-F]{24}$/)
}

// 获取emoji
export const getEmoji = () => {
  return emoji
}

export const videoUrlToBlob = async url => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error fetching video:', error)
    throw error
  }
}

export const revokeVideoObjectURL = url => {
  URL.revokeObjectURL(url)
}

// 传入开始时间和结束时间，如果结束时间不存在用现在的时间，计算两个时间差，1天以内返回x小时，1天以上返回x天，1周以上返回x周x天，1个月以上返回x个月x天，1年以上返回x年x月
export const getACGDuration = (startTime, endTime) => {
  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  const diff = end - start
  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365
  let result = ''
  if (diff < hour) {
    result = `${Math.floor(diff / minute)}分钟`
  } else if (diff < day) {
    result = `${Math.floor(diff / hour)}小时`
  } else if (diff < week) {
    result = `${Math.floor(diff / day)}天`
  } else if (diff < month) {
    const weeks = Math.floor(diff / week)
    const days = Math.floor((diff % week) / day)
    result = `${weeks}周${days ? days + '天' : ''}`
  } else if (diff < year) {
    const months = Math.floor(diff / month)
    const days = Math.floor((diff % month) / day)
    result = `${months}个月${days ? days + '天' : ''}`
  } else {
    const years = Math.floor(diff / year)
    const months = Math.floor((diff % year) / month)
    result = `${years}年${months ? months + '个月' : ''}`
  }
  return result
}

export const ratingToText = rating => {
  if (rating >= 90) return '神作'
  if (rating >= 80) return '佳作'
  if (rating >= 70) return '良作'
  if (rating >= 60) return '还行'
  if (rating >= 50) return '劣作'
  if (rating >= 40) return '差'
  if (rating >= 30) return '烂作'
  if (rating >= 20) return '烂差'
  if (rating >= 10) return '迷'
  if (rating >= 1) return '???'
  return '暂无评分'
}

export const generateRandomString = length => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const seasonToName = season => {
  switch (season) {
    case 1:
      return '冬季新番'
    case 2:
      return '春季新番'
    case 3:
      return '夏季新番'
    case 4:
      return '秋季新番'
    case -1:
    case undefined:
      return '所有季度'
    default:
      return season
  }
}

export const nextFrame = fn => {
  window.requestAnimationFrame(() => window.requestAnimationFrame(fn))
}

export const copyToClipboard = async (text, toast) => {
  try {
    await navigator.clipboard.writeText(text)
    if (!toast) return
    toast.add({
      title: '复制成功',
      icon: 'i-heroicons-check-circle',
      color: 'green',
      timeout: 10000
    })
  } catch (err) {
    if (!toast) return
    toast.add({
      title: '复制失败',
      icon: 'i-heroicons-x-circle',
      color: 'red',
      timeout: 10000
    })
  }
}

export const changedParams = (checkedParams, paramsValue) => {
  console.log(checkedParams, paramsValue)

  // 获取两个对象的所有唯一字段
  const allKeys = [
    ...new Set([...Object.keys(checkedParams), ...Object.keys(paramsValue)])
  ]

  // 比较所有字段的值
  const list = allKeys.filter(key => checkedParams[key] !== paramsValue[key])

  console.log(list)
  return list
}
