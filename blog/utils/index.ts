import PhotoSwipeLightbox from 'photoswipe/lightbox'
import emoji from '@/utils/emoji.json'

console.log(process.client)
let lightbox: any = null
if (process.client) {
  lightbox = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
  })
  lightbox.init()
  let videoTimer: any = null
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
    videoTimer && clearTimeout(videoTimer)
    videoTimer = setTimeout(() => {
      // 所有.previewer-video-body的video都暂停
      const videos = document.querySelectorAll(
        '.previewer-video-body video'
      ) as NodeListOf<HTMLVideoElement>
      videos.forEach((video) => {
        video.pause()
      })
      // 当前video播放
      const video = document.querySelector(
        `#lightbox-video-${currIndex}`
      ) as HTMLVideoElement
      video && video.play()
    }, 100)
  })
  lightbox.on('close', () => {
    console.log('close', lightbox)
    if (window.location.hash === '#lightboxopen') {
      window.history.back()
    }
    // 清除session
    sessionStorage.removeItem('lastlightboxData')
  })
  lightbox.on('bindEvents', () => {
    console.log('bindEvents')
    const currIndex = lightbox.pswp.currIndex
    videoTimer = setTimeout(() => {
      // 所有.previewer-video-body的video都暂停
      const videos = document.querySelectorAll(
        '.previewer-video-body video'
      ) as NodeListOf<HTMLVideoElement>
      videos.forEach((video) => {
        video.pause()
      })
      // 当前video播放
      const video = document.querySelector(
        `#lightbox-video-${currIndex}`
      ) as HTMLVideoElement
      video && video.play()
    }, 500)
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
        loadAndOpenImg(
          lastlightboxData.index,
          lastlightboxData.dataSource,
          true
        )
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

export function loadAndOpenImg(
  index: number,
  DataSource: [any],
  isFromCache: boolean = false
) {
  let newDataSource = DataSource
  if (!isFromCache) {
    // 需要格式化数据
    newDataSource.forEach((item, index) => {
      const mimetype = item.mimetype
      const { src, width, height } = item
      if (mimetype && mimetype.indexOf('video') > -1) {
        newDataSource[index] = {
          html: `<div class="previewer-video-body">
                    <video 
                      id="lightbox-video-${index}"
                      controls="controls"
                      playsinline="true"
                      preload="auto"
                      muted="muted"
                      autoplay="autoplay"
                      loop="loop"
                      width="${width}"
                      height="${height}">
                      <source
                        src="${src}"
                        type="video/mp4"
                      />
                      </video>
                    </div>`,
        }
      }
    })
  }
  lightbox && lightbox.loadAndOpen(index, newDataSource)
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
  const strArray = Array.from(str)
  if (strArray.length > len) {
    return strArray.slice(0, len).join('') + '...'
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
  const day = 1000 * 60 * 60 * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365
  let result = ''
  if (diff < day) {
    result = `${Math.floor(diff / (1000 * 60 * 60))}小时`
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
