import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Tiptap extension for image groups
 * Renders a grid of images with even/odd layout support
 */
const ImageGroup = Node.create({
  name: 'imageGroup',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      childrenList: { default: [] }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-w-e-type="imageGroup"]',
        getAttrs: dom => {
          const imgList = dom.querySelectorAll('img')
          const childrenList = []
          imgList.forEach(img => {
            childrenList.push({
              src: img.getAttribute('src') || '',
              width: img.getAttribute('width') || '',
              height: img.getAttribute('height') || '',
              dataHref: img.getAttribute('data-href') || '',
              dataHrefWidth: img.getAttribute('data-href-width') || '',
              dataHrefHeight: img.getAttribute('data-href-height') || '',
              alt: img.getAttribute('alt') || ''
            })
          })
          return { childrenList }
        }
      }
    ]
  },

  renderHTML({ node }) {
    const childrenList = node.attrs.childrenList || []
    let className = 'w-e-image-group'
    if (childrenList.length % 2 === 0) {
      className += ' w-e-image-group-even'
    } else {
      className += ' w-e-image-group-odd'
    }

    const imgElements = childrenList.map(child => {
      return [
        'div',
        { class: 'w-e-image-group-img-body' },
        [
          'img',
          {
            src: child.src,
            class: 'w-e-image-group-img',
            width: child.width,
            height: child.height,
            'data-href': child.dataHref,
            'data-href-width': child.dataHrefWidth,
            'data-href-height': child.dataHrefHeight,
            alt: child.alt,
            loading: 'lazy'
          }
        ]
      ]
    })

    return [
      'div',
      mergeAttributes({
        'data-w-e-type': 'imageGroup',
        'data-w-e-is-void': '',
        class: className
      }),
      ...imgElements
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      const childrenList = node.attrs.childrenList || []
      let className = 'w-e-image-group'
      if (childrenList.length % 2 === 0) {
        className += ' w-e-image-group-even'
      } else {
        className += ' w-e-image-group-odd'
      }
      dom.className = className
      dom.setAttribute('data-w-e-type', 'imageGroup')

      childrenList.forEach(child => {
        const imgBody = document.createElement('div')
        imgBody.className = 'w-e-image-group-img-body'
        const img = document.createElement('img')
        img.src = child.src || ''
        img.className = 'w-e-image-group-img'
        if (child.width) img.width = child.width
        if (child.height) img.height = child.height
        if (child.dataHref) img.setAttribute('data-href', child.dataHref)
        if (child.dataHrefWidth)
          img.setAttribute('data-href-width', child.dataHrefWidth)
        if (child.dataHrefHeight)
          img.setAttribute('data-href-height', child.dataHrefHeight)
        img.alt = child.alt || ''
        img.loading = 'lazy'
        imgBody.appendChild(img)
        dom.appendChild(imgBody)
      })

      return { dom }
    }
  }
})

export default ImageGroup
