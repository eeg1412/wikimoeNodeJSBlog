import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Tiptap extension for video content
 * Supports regular video URLs and iframe embeds (e.g., Bilibili)
 */
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: '' },
      poster: { default: '' },
      width: { default: '' },
      height: { default: '' }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-w-e-type="video"]',
        getAttrs: dom => {
          const iframe = dom.querySelector('iframe')
          if (iframe) {
            return {
              src: iframe.outerHTML,
              width: iframe.getAttribute('width') || '',
              height: iframe.getAttribute('height') || ''
            }
          }
          const video = dom.querySelector('video')
          if (video) {
            const source = video.querySelector('source')
            return {
              src: source ? source.getAttribute('src') : video.getAttribute('src') || '',
              poster: video.getAttribute('poster') || '',
              width: video.getAttribute('width') || '',
              height: video.getAttribute('height') || ''
            }
          }
          return {}
        }
      }
    ]
  },

  renderHTML({ node }) {
    const src = node.attrs.src || ''
    if (src.trim().startsWith('<iframe')) {
      // iframe mode - return raw HTML wrapper
      return [
        'div',
        mergeAttributes({ 'data-w-e-type': 'video', 'data-w-e-is-void': '' }),
        0
      ]
    }
    // Regular video
    const videoAttrs = {
      playsinline: 'true',
      preload: 'none',
      muted: 'muted',
      loop: 'loop',
      controls: 'true'
    }
    if (node.attrs.poster) videoAttrs.poster = node.attrs.poster
    if (node.attrs.width && node.attrs.width !== 'auto')
      videoAttrs.width = node.attrs.width
    if (node.attrs.height && node.attrs.height !== 'auto')
      videoAttrs.height = node.attrs.height
    return [
      'div',
      mergeAttributes({ 'data-w-e-type': 'video', 'data-w-e-is-void': '' }),
      ['video', videoAttrs, ['source', { src: src, type: 'video/mp4' }]]
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-w-e-type', 'video')
      dom.style.margin = '10px 0'

      const src = node.attrs.src || ''
      if (src.trim().startsWith('<iframe')) {
        dom.innerHTML = src
        const iframe = dom.querySelector('iframe')
        if (iframe) {
          iframe.style.maxWidth = '100%'
          if (!iframe.style.width) iframe.style.width = '100%'
          if (!iframe.style.height && !iframe.style.aspectRatio) {
            iframe.style.aspectRatio = '16 / 9'
            iframe.style.height = 'auto'
          }
        }
      } else {
        const video = document.createElement('video')
        video.setAttribute('playsinline', 'true')
        video.setAttribute('preload', 'none')
        video.setAttribute('muted', 'muted')
        video.setAttribute('loop', 'loop')
        video.setAttribute('controls', 'true')
        video.style.maxWidth = '100%'
        if (node.attrs.poster) video.poster = node.attrs.poster
        if (node.attrs.width && node.attrs.width !== 'auto')
          video.width = node.attrs.width
        if (node.attrs.height && node.attrs.height !== 'auto')
          video.height = node.attrs.height
        const source = document.createElement('source')
        source.src = src
        source.type = 'video/mp4'
        video.appendChild(source)
        dom.appendChild(video)
      }

      return { dom }
    }
  }
})

export default Video
