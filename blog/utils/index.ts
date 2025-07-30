import emoji from '@/utils/emoji.json'

type OpenFunction = (
  list: any[],
  showIndex: number,
  closeCallback?: () => void
) => void

let photoSwipe = {
  open: null as OpenFunction | null
}

export function setPhotoSwipe(open: OpenFunction) {
  photoSwipe.open = open
}

export function openPhotoSwipe(
  list: any[],
  showIndex: number,
  closeCallback?: () => void
) {
  if (photoSwipe.open) {
    photoSwipe.open(list, showIndex, closeCallback)
  }
}

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
export function formatNumber(num: number) {
  if (num < 10000) {
    return num
  } else if (num < 100000000) {
    return (num / 10000).toFixed(1) + '万'
  } else {
    return (num / 100000000).toFixed(1) + '亿'
  }
}

export const limitStr = (str: string, len: number) => {
  const strArray = Array.from(str)
  if (strArray.length > len) {
    return strArray.slice(0, len).join('') + '...'
  }
  return str
}

export const getTitleFromText = (text: string): string => {
  if (!text) return ''
  const arr = Array.from(text)
  const firstIdx = text.search(/[\n\r。\.？\?！!；;…]/)
  let endIdx = firstIdx === -1 ? arr.length : firstIdx
  let titleArr = arr.slice(0, endIdx)
  let title = titleArr.join('')
  const limit = 50
  if (titleArr.length > limit) {
    title = limitStr(title, limit)
  }
  return title
}

// 生成uuid
export const uuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // eslint-disable-next-line no-mixed-operators
    const r = (Math.random() * 16) | 0
    // eslint-disable-next-line no-mixed-operators, eqeqeq
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
// 检查uuid是否格式是否合法
export const checkUuidFormat = (uuid: string): boolean => {
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

export const isObjectId = (value: string) => {
  return value.match(/^[0-9a-fA-F]{24}$/)
}

// 获取emoji
export const getEmoji = () => {
  return emoji
}

export const videoUrlToBlob = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error fetching video:', error)
    throw error
  }
}

export const revokeVideoObjectURL = (url: string) => {
  URL.revokeObjectURL(url)
}

// 传入开始时间和结束时间，如果结束时间不存在用现在的时间，计算两个时间差，1天以内返回x小时，1天以上返回x天，1周以上返回x周x天，1个月以上返回x个月x天，1年以上返回x年x月
export const getACGDuration = (startTime: string, endTime?: string) => {
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

export const ratingToText = (rating: number) => {
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

export const generateRandomString = (length: number) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const seasonToName = (season: number) => {
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

export const nextFrame = (fn: () => void) => {
  window.requestAnimationFrame(() => window.requestAnimationFrame(fn))
}

export const copyToClipboard = async (text: string, toast: any) => {
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

export const changedParams = (
  checkedParams: object,
  paramsValue: object
): string[] => {
  console.log(checkedParams, paramsValue)

  // 获取两个对象的所有唯一字段
  const allKeys = [
    ...new Set([...Object.keys(checkedParams), ...Object.keys(paramsValue)])
  ]

  // 比较所有字段的值
  const list = allKeys.filter(
    key => (checkedParams as any)[key] !== (paramsValue as any)[key]
  )

  console.log(list)
  return list
}
