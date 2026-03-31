import Image from '@tiptap/extension-image'

/**
 * Extended Image extension with data-href support
 * for full-size image linking
 */
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataHref: {
        default: null,
        parseHTML: element => element.getAttribute('data-href'),
        renderHTML: attributes => {
          if (!attributes.dataHref) return {}
          return { 'data-href': attributes.dataHref }
        }
      },
      dataHrefWidth: {
        default: null,
        parseHTML: element => element.getAttribute('data-href-width'),
        renderHTML: attributes => {
          if (!attributes.dataHrefWidth) return {}
          return { 'data-href-width': attributes.dataHrefWidth }
        }
      },
      dataHrefHeight: {
        default: null,
        parseHTML: element => element.getAttribute('data-href-height'),
        renderHTML: attributes => {
          if (!attributes.dataHrefHeight) return {}
          return { 'data-href-height': attributes.dataHrefHeight }
        }
      },
      loading: {
        default: 'lazy',
        renderHTML: attributes => {
          return { loading: attributes.loading || 'lazy' }
        }
      }
    }
  }
})

export default CustomImage
