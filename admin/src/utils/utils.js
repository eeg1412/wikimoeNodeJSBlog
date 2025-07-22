import store from '@/store'
import { ElLoading, ElMessage, ElNotification } from 'element-plus'
import moment from 'moment'
import { get, set, delMany } from 'idb-keyval'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { Viewer } from '@photo-sphere-viewer/core'

let loading = null

let loadingCount = 0
let loadingTimer = null

const panoramaListMap = {}
const clearPanoramaListMap = () => {
  for (const key in panoramaListMap) {
    if (panoramaListMap[key]) {
      panoramaListMap[key].destroy()
      delete panoramaListMap[key]
      console.log('destroy', key, panoramaListMap)
    }
  }
}
const panoramaLang = {
  zoom: '缩放',
  zoomOut: '缩小',
  zoomIn: '放大',
  moveUp: '向上移动',
  moveDown: '向下移动',
  moveLeft: '向左移动',
  moveRight: '向右移动',
  description: '描述',
  download: '下载',
  fullscreen: '全屏',
  loading: '加载中...',
  menu: '菜单',
  close: '关闭',
  twoFingers: '使用双指导航',
  ctrlZoom: '使用Ctrl+滚轮缩放图片',
  loadError: '全景图无法加载',
  webglError: '您的浏览器似乎不支持WebGL'
}

const lightbox = new PhotoSwipeLightbox({
  pswpModule: () => import('photoswipe'),
  secondaryZoomLevel: 1
})
lightbox.init()
let videoTimer = null
lightbox.on('pointerDown', e => {
  // console.log(e)
  const target = e.originalEvent.target
  // 如果是video元素或者canvas元素，阻止事件冒泡
  if (target.tagName === 'VIDEO' || target.tagName === 'CANVAS') {
    e.preventDefault()
  }
})
lightbox.on('close', () => {
  clearPanoramaListMap()
})
lightbox.on('change', () => {
  const currSlide = lightbox.pswp.currSlide
  const data = currSlide?.data

  // triggers when slide is switched, and at initialization
  console.log('change', lightbox)
  const currIndex = lightbox.pswp.currIndex

  clearPanoramaListMap()
  let image360PanoramaTimer = null
  const is360Panorama = data?.is360Panorama
  if (is360Panorama === true) {
    if (image360PanoramaTimer) {
      clearTimeout(image360PanoramaTimer)
      image360PanoramaTimer = null
    }
    image360PanoramaTimer = setTimeout(() => {
      const container = document.querySelector(
        `#lightbox-360panorama-${currIndex}`
      )
      if (!container) {
        return
      }
      // 清空container
      container.innerHTML = ''
      const viewer = new Viewer({
        container: container,
        panorama: data?.imageSrc,
        navbar: false,
        defaultZoomLvl: 10,
        lang: panoramaLang
      })
      panoramaListMap[currIndex] = viewer
    }, 800)
  }

  videoTimer && clearTimeout(videoTimer)
  videoTimer = setTimeout(() => {
    // 所有.previewer-video-body的video都暂停
    const videos = document.querySelectorAll('.previewer-video-body video')
    videos.forEach(video => {
      video.pause()
    })
    // 当前video播放
    const video = document.querySelector(`#lightbox-video-${currIndex}`)
    video && video.play()
  }, 800)
})
lightbox.on('bindEvents', () => {
  console.log('bindEvents')
  const currIndex = lightbox.pswp.currIndex
  videoTimer = setTimeout(() => {
    // 所有.previewer-video-body的video都暂停
    const videos = document.querySelectorAll('.previewer-video-body video')
    videos.forEach(video => {
      video.pause()
    })
    // 当前video播放
    const video = document.querySelector(`#lightbox-video-${currIndex}`)
    video && video.play()
  }, 500)
})

export function tryCloseLightbox() {
  lightbox && lightbox.pswp && lightbox.pswp.close()
}

export function loadAndOpenImg(index, DataSource, isFromCache) {
  let newDataSource = DataSource
  if (!isFromCache) {
    // 需要格式化数据
    newDataSource.forEach((item, index) => {
      const mimetype = item.mimetype
      const { src, width, height, is360Panorama } = item
      if (is360Panorama) {
        const maxWidth = Math.round(width * 0.8)
        const maxHeight = Math.round(height * 0.8)
        newDataSource[index] = {
          html: `<div class="content-360panorama-body"><div class="content-360panorama-content" style="max-width:${maxWidth}px;max-height:${maxHeight}px;" id="lightbox-360panorama-${index}">加载中...</div></div>`,
          is360Panorama: true,
          imageSrc: src
        }
      } else if (mimetype && mimetype.indexOf('video') > -1) {
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
                    </div>`
        }
      }
    })
  }
  lightbox && lightbox.loadAndOpen(index, newDataSource)
}

const startLoading = () => {
  store.dispatch('setLoading', true)
  // 获取当前html标签中是否包含dark的class
  const isDark = document.documentElement.classList.contains('dark')
  const background = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
  loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: background
  })
}

const endLoading = () => {
  store.dispatch('setLoading', false)
  if (loading) {
    loading.close()
  }
}

export const showLoading = () => {
  clearTimeout(loadingTimer)
  loadingTimer = setTimeout(() => {
    loadingCount = 1
    hideLoading()
  }, 30000)
  if (loadingCount === 0) {
    startLoading()
  }
  loadingCount += 1
}

export const hideLoading = () => {
  if (loadingCount <= 0) {
    return
  }
  loadingCount -= 1
  if (loadingCount === 0) {
    clearTimeout(loadingTimer)
    endLoading()
  }
}

export const setSessionParams = (key, data) => {
  sessionStorage.setItem(key, JSON.stringify(data))
}
export const getSessionParams = (key, isSelector) => {
  let data = null
  if (isSelector) {
    return data
  }
  try {
    const strData = sessionStorage.getItem(key)
    if (strData) {
      data = JSON.parse(strData)
    }
  } catch (error) {}
  return data
}

export const creatColorByNickName = NickName => {
  // nick name to code
  let id = 0
  for (var i = 0; i < NickName.length; i++) {
    id += NickName.charCodeAt(i)
  }
  id = id % 100
  const h = id * (360 / 100)
  const s = 80
  const l = 30
  return hslToHex(h, s, l)
}
export const hslToHex = (h, s, l) => {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0') // convert to Hex and prefix "0" if needed
  }
  return `${f(0)}${f(8)}${f(4)}`
}

export const unique = arr => {
  return Array.from(new Set(arr))
}
export const uniqueObjArray = (arr, key) => {
  const map = {
    string: e => e[key],
    function: e => key(e)
  }
  const fn = map[typeof key]
  const obj = arr.reduce((o, e) => ((o[fn(e)] = e), o), {})
  return Object.values(obj)
}

export const uuid = () => {
  let chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('')
  for (let i = 0, len = chars.length; i < len; i++) {
    switch (chars[i]) {
      case 'x':
        chars[i] = Math.floor(Math.random() * 16).toString(16)
        break
      case 'y':
        chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16)
        break
    }
  }
  return chars.join('')
}

// 随机生成英文字母
export const generateRandomAlphabetString = length => {
  const characters = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const startEndTimeCheck = (rule, value, callback, start, end) => {
  if (start && end) {
    if (new Date(start).getTime() >= new Date(end).getTime()) {
      callback(new Error('开始时间或结束时间的设置有误'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

export const formatDate = (value, format = 'YYYY/MM/DD HH:mm:ss') => {
  if (!value) {
    return ''
  }
  return moment(value).format(format)
}

export const formatResToForm = (form, obj) => {
  Object.keys(form).forEach(key => {
    if (obj[key]) {
      // 判断form[key]的类型，有数字，字符串，布尔，数组，但是value只有字符串，所以需要转换
      if (typeof form[key] === 'number') {
        form[key] = Number(obj[key])
      } else if (typeof form[key] === 'boolean') {
        form[key] = obj[key] === 'true'
      } else if (Array.isArray(form[key])) {
        form[key] = obj[key].split(',')
      } else {
        form[key] = obj[key]
      }
    }
  })
}

export const formatResToObj = data => {
  const obj = {}
  data.forEach(item => {
    obj[item.name] = item.value
  })
  return obj
}
export const copyToClipboard = text => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage({
        message: '复制成功',
        type: 'success'
      })
    })
    .catch(err => {
      ElMessage({
        message: '复制失败',
        type: 'error'
      })
    })
}

// 安装ffmepg
const coreURL = `/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js`
const wasmURL = `/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm`

export const installBufferToIndexedDB = async (key, url) => {
  const response = await fetch(url)
  // if not ok, throw error
  if (!response.ok) {
    ElMessage.error(`Unable to fetch: ${url}`)
    throw new Error(`Unable to fetch: ${url}`)
  }
  const reader = response.body?.getReader()
  if (!reader) {
    ElMessage.error(`Unable to fetch: ${url}`)
    throw new Error(`Unable to fetch: ${url}`)
  }
  let receivedLength = 0
  const chunks = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    chunks.push(value)
    receivedLength += value.length
  }

  const buffer = await new Blob(chunks).arrayBuffer()

  try {
    set(key, buffer)
    console.log(`Saved to IndexedDB: ${url}`)
  } catch {
    ElMessage.error(`Failed to save to IndexedDB: ${url}`)
    console.warn(`Failed to save to IndexedDB: ${url}`)
  }
}

export const installFFmpeg = async baseUrl => {
  await installBufferToIndexedDB('ffmpeg-core.js', baseUrl + coreURL)
  await installBufferToIndexedDB('ffmpeg-core.wasm', baseUrl + wasmURL)
}

export const uninstallFFmpeg = async () => {
  await delMany(['ffmpeg-core.js', 'ffmpeg-core.wasm'])
}

export const getFFmpegInstalled = async () => {
  const core = await get('ffmpeg-core.js')
  const wasm = await get('ffmpeg-core.wasm')
  return core && wasm
}

const retrieveBlob = async (key, type) => {
  const buffer = await get(key)
  if (!buffer) {
    ElMessage.error(`Failed to retrieve from IndexedDB: ${key}`)
    throw new Error(`Failed to retrieve from IndexedDB: ${key}`)
  }
  const blob = new Blob([buffer], { type })
  return URL.createObjectURL(blob)
}
export const initFFmpeg = async () => {
  const ffmpeg = new FFmpeg()
  await ffmpeg.load({
    coreURL: await retrieveBlob(`ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await retrieveBlob(`ffmpeg-core.wasm`, 'application/wasm')
  })
  return ffmpeg
}

export const execFFmpeg = async (ffmpeg, file, args, outputFileName) => {
  try {
    await ffmpeg.writeFile('input', new Uint8Array(await file.arrayBuffer()))
    await ffmpeg.exec([...args])

    const data = await ffmpeg.readFile(outputFileName)
    return new File([data.buffer], outputFileName, { type: 'video/mp4' })
  } finally {
    try {
      await ffmpeg.deleteFile('input')
    } catch {
      //
    }
    try {
      await ffmpeg.deleteFile(outputFileName)
    } catch {
      //
    }
  }
}

export const dataURLtoBlob = dataurl => {
  let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// 文字中的空格和全角空格替换为下划线
export const replaceSpacesWithUnderscores = str => {
  return str.replace(/[\s\u3000]/g, '-')
}

export const seasonToStr = season => {
  let str = ''
  switch (season) {
    case 1:
      str = '冬'
      break
    case 2:
      str = '春'
      break
    case 3:
      str = '夏'
      break
    case 4:
      str = '秋'
      break
  }
  return str
}

// 转义html
export const escapeHtml = str => {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const nowTimestampToBase36WithRandom = () => {
  const timestamp = Math.floor(Date.now() / 1000) // 当前时间戳（秒）
  // 将时间戳转换为36进制字符串
  let base36String = timestamp.toString(36)

  // 生成2位随机字符串
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let randomString = ''
  for (let i = 0; i < 2; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // 返回结果
  return base36String + randomString
}
export const fieldErrorNotice = fields => {
  // 检查fields是否是Object
  if (typeof fields === 'object') {
    // 遍历Object
    for (const key in fields) {
      // 判断是否是数组
      if (Array.isArray(fields[key]) && fields[key].length > 0) {
        // 遍历数组
        fields[key].forEach(field => {
          // 判断是否是对象
          if (typeof field === 'object') {
            // 判断是否有message属性
            if (field.message) {
              setTimeout(() => {
                ElNotification.error({
                  message: field.message,
                  type: 'error'
                })
              }, 10)
            }
          }
        })
      }
    }
  }
}

export const limitStr = (str = '', len = 20) => {
  const strArray = Array.from(str || '')
  if (strArray.length > len) {
    return strArray.slice(0, len).join('') + '...'
  }
  return str
}
