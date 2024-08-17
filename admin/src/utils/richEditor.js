import { i18nAddResources } from '@wangeditor/editor'
import { Boot } from '@wangeditor/editor'
import editorMenuEventSpan from './editorMenu/event'
import editorMenuPhotoswiper from './editorMenu/photoswiper'
import editorMenuImage from './editorMenu/image'

i18nAddResources('zh-CN', {
  videoModule: {
    uploadVideo: '视频媒体库',
  },
  uploadImgModule: {
    uploadImage: '图片媒体库',
  },
})

const imageToHtmlConf = {
  type: 'image',
  elemToHtml: (elemNode) => {
    const {
      src,
      alt = '',
      href = '',
      style = {},
      width,
      height,
      hrefWidth,
      hrefHeight,
    } = elemNode
    const { width: styWidth = '', height: styHeight = '' } = style

    let styleStr = ''
    if (styWidth) styleStr += `width: ${styWidth};`
    if (styHeight) styleStr += `height: ${styHeight};`
    return `<img src="${src}" alt="${alt}"${href ? ` data-href="${href}"` : ''
      }${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}${hrefWidth ? ` data-href-width="${hrefWidth}"` : ''
      }${hrefHeight ? ` data-href-height="${hrefHeight}"` : ''
      } style="${styleStr}">`
  },
}

function genSizeStyledIframeHtml (iframeHtml, width = '', height = '') {
  const parser = new DOMParser()
  const doc = parser.parseFromString(iframeHtml, 'text/html')
  const iframe = doc.querySelector('iframe')

  if (iframe) {
    if (width && width !== 'auto') iframe.setAttribute('width', width)
    if (height && height !== 'auto') iframe.setAttribute('height', height)
    if (width && height && width !== 'auto' && height !== 'auto') {
      // 设置style aspect-ratio
      iframe.setAttribute(
        'style',
        `width: 100%; height: auto; aspect-ratio: ${width} / ${height};`
      )
    }
    return iframe.outerHTML
  }

  return ''
}
const videoToHtmlConf = {
  type: 'video',
  elemToHtml: (elemNode) => {
    const { src = '', poster = '', width = '', height = '' } = elemNode
    let res = '<div data-w-e-type="video" data-w-e-is-void>\n'

    if (src.trim().indexOf('<iframe ') === 0) {
      // iframe 形式
      const iframeHtml = genSizeStyledIframeHtml(src, width, height)
      res += iframeHtml
    } else {
      // 其他，mp4 等 url 格式
      res += `<video poster="${poster}" playsinline="true" preload="none" muted="muted" loop="loop" controls="true"${width && width !== 'auto' ? ` width="${width}"` : ''
        }${height && height !== 'auto' ? ` height="${height}"` : ''
        }><source src="${src}" type="video/mp4"/></video>`
    }
    res += '\n</div>'

    return res
  },
}

function getStyleValue ($elem, styleKey) {
  let res = ''

  const styleStr = $elem.getAttribute('style') || '' // 如 'line-height: 2.5; color: red;'
  const styleArr = styleStr.split(';') // 如 ['line-height: 2.5', ' color: red', '']
  const length = styleArr.length
  for (let i = 0; i < length; i++) {
    const styleItemStr = styleArr[i] // 如 'line-height: 2.5'
    if (styleItemStr) {
      const arr = styleItemStr.split(':') // ['line-height', ' 2.5']
      if (arr[0].trim() === styleKey) {
        res = arr[1].trim()
      }
    }
  }

  return res
}

function parseImgHtml (elem, children, editor) {
  const $elem = elem
  let href = $elem.getAttribute('data-href') || ''
  href = decodeURIComponent(href) // 兼容 V4

  return {
    type: 'image',
    src: $elem.getAttribute('src') || '',
    alt: $elem.getAttribute('alt') || '',
    width: $elem.getAttribute('width') || '',
    height: $elem.getAttribute('height') || '',
    hrefWidth: $elem.getAttribute('data-href-width') || '',
    hrefHeight: $elem.getAttribute('data-href-height') || '',
    href,
    style: {
      width: getStyleValue($elem, 'width'),
      height: getStyleValue($elem, 'height'),
    },
    children: [{ text: '' }], // void node 有一个空白 text
  }
}

const parseImgHtmlConf = {
  selector: 'img:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseImgHtml,
}

export const initRichEditor = () => {
  Boot.registerElemToHtml(imageToHtmlConf)
  Boot.registerParseElemHtml(parseImgHtmlConf)
  Boot.registerElemToHtml(videoToHtmlConf)
  Boot.registerModule(editorMenuEventSpan)
  Boot.registerModule(editorMenuPhotoswiper)
  Boot.registerModule(editorMenuImage)
}