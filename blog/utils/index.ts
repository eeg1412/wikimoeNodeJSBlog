import PhotoSwipeLightbox from 'photoswipe/lightbox'
import emoji from '@/utils/emoji.json'

console.log(process.client)
let lightbox: any = null
if (process.client) {
  lightbox = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
  })
  lightbox.init()
  lightbox.on('change', () => {
    // triggers when slide is switched, and at initialization
    console.log('change', lightbox)
    const dataSource = lightbox.options.dataSource
    const currIndex = lightbox.pswp.currIndex
    const data = {
      index: currIndex,
      dataSource,
    }
    // 存入session
    sessionStorage.setItem('lastlightboxData', JSON.stringify(data))
    if (window.location.hash !== '#lightboxopen') {
      window.history.pushState(null, '', '#lightboxopen')
    }
  })
  lightbox.on('close', () => {
    console.log('close', lightbox)
    if (window.location.hash === '#lightboxopen') {
      window.history.back()
    }
    // 清除session
    sessionStorage.removeItem('lastlightboxData')
  })
  // 监听hash变化
  window.addEventListener('hashchange', () => {
    console.log('hashchange', lightbox)
    if (window.location.hash !== '#lightboxopen') {
      tryCloseLightbox()
    }
  })
  checkLightbox()
}

export function checkLightbox() {
  const lightboxopen = window.location.hash === '#lightboxopen'
  if (lightboxopen) {
    // 尝试去缓存获取 lastlightboxData
    const lastlightboxDataStr = sessionStorage.getItem('lastlightboxData')
    let lastlightboxData = null
    if (lastlightboxDataStr) {
      // try catch转成json
      try {
        lastlightboxData = JSON.parse(lastlightboxDataStr)
      } catch (error) {
        lastlightboxData = null
      }
      if (lastlightboxData) {
        loadAndOpenImg(lastlightboxData.index, lastlightboxData.dataSource)
      } else {
        // 没有缓存，清除参数
        window.location.hash = ''
      }
    } else {
      // 没有缓存，清除参数
      window.location.hash = ''
    }
  }
}

export function tryCloseLightbox() {
  lightbox && lightbox.pswp && lightbox.pswp.close()
}

export function loadAndOpenImg(index: number, DataSource: [any]) {
  lightbox && lightbox.loadAndOpen(index, DataSource)
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

export const limitStr = (str: string, len: number) => {
  if (str.length > len) {
    return str.substring(0, len) + '...'
  }
  return str
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
// 检查本地是否存在uuid，没有则生成
export const checkUuid = () => {
  let storedUuid = localStorage.getItem('uuid')
  if (!storedUuid) {
    storedUuid = uuid()
    localStorage.setItem('uuid', storedUuid)
  }
  return storedUuid
}

// 获取emoji
export const getEmoji = () => {
  return emoji
}
