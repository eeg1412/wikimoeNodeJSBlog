import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Tiptap extension for 360° panorama images
 */
const Panorama360 = Node.create({
  name: 'panorama360',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: '' },
      width: { default: '100%' },
      height: { default: '400px' },
      dataHref: { default: '' },
      dataHrefWidth: { default: '' },
      dataHrefHeight: { default: '' },
      alt: { default: '360°全景图片' }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.w-e-panorama360',
        getAttrs: dom => {
          const img = dom.querySelector('img.w-e-panorama360-img')
          if (!img) return false
          return {
            src: img.getAttribute('src') || '',
            width: img.getAttribute('width') || '100%',
            height: img.getAttribute('height') || '400px',
            dataHref: img.getAttribute('data-href') || '',
            dataHrefWidth: img.getAttribute('data-href-width') || '',
            dataHrefHeight: img.getAttribute('data-href-height') || '',
            alt: img.getAttribute('alt') || '360°全景图片'
          }
        }
      }
    ]
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({
        'data-w-e-type': 'panorama360',
        'data-w-e-is-void': '',
        class: 'w-e-panorama360'
      }),
      [
        'img',
        {
          src: node.attrs.src,
          class: 'w-e-panorama360-img',
          width: node.attrs.width,
          height: node.attrs.height,
          'data-href': node.attrs.dataHref,
          'data-href-width': node.attrs.dataHrefWidth,
          'data-href-height': node.attrs.dataHrefHeight,
          alt: node.attrs.alt,
          'data-type': 'panorama360',
          loading: 'lazy'
        }
      ]
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.className = 'w-e-panorama360'
      dom.setAttribute('data-w-e-type', 'panorama360')
      dom.style.width = '100%'
      dom.style.position = 'relative'

      const img = document.createElement('img')
      img.src = node.attrs.src || ''
      img.className = 'w-e-panorama360-img'
      img.style.width = '100%'
      img.style.height = 'auto'
      img.style.maxHeight = '400px'
      img.style.objectFit = 'cover'
      if (node.attrs.dataHref) img.setAttribute('data-href', node.attrs.dataHref)
      if (node.attrs.dataHrefWidth)
        img.setAttribute('data-href-width', node.attrs.dataHrefWidth)
      if (node.attrs.dataHrefHeight)
        img.setAttribute('data-href-height', node.attrs.dataHrefHeight)
      img.alt = node.attrs.alt || '360°全景图片'
      img.setAttribute('data-type', 'panorama360')
      img.loading = 'lazy'
      dom.appendChild(img)

      // Add panorama badge
      const badge = document.createElement('div')
      badge.textContent = '360°'
      badge.style.cssText =
        'position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; pointer-events: none;'
      dom.appendChild(badge)

      return { dom }
    }
  }
})

export default Panorama360
