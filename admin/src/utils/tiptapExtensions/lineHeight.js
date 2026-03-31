import { Extension } from '@tiptap/core'

/**
 * Line height extension for paragraph and heading nodes
 */
const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading']
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element =>
              element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        lineHeight =>
        ({ commands }) => {
          return this.options.types.every(type =>
            commands.updateAttributes(type, { lineHeight })
          )
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          return this.options.types.every(type =>
            commands.resetAttributes(type, 'lineHeight')
          )
        }
    }
  }
})

export default LineHeight
