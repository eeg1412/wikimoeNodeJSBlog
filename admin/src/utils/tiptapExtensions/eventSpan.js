import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Custom Tiptap extension for event span (inline, void)
 * Renders as a clickable span linked to an event
 */
const EventSpan = Node.create({
  name: 'eventspan',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      textContent: { default: '' }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-w-e-type="eventspan"]',
        getAttrs: dom => ({
          id: dom.getAttribute('data-id') || '',
          textContent: dom.textContent || ''
        })
      }
    ]
  },

  renderHTML({ node }) {
    return [
      'span',
      mergeAttributes({
        'data-w-e-type': 'eventspan',
        'data-w-e-is-void': '',
        'data-w-e-is-inline': '',
        'data-id': node.attrs.id,
        style:
          'cursor: pointer; color: var(--el-color-primary, #409eff); text-decoration: underline;'
      }),
      node.attrs.textContent
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('span')
      dom.setAttribute('data-w-e-type', 'eventspan')
      dom.setAttribute('data-id', node.attrs.id || '')
      dom.style.cursor = 'pointer'
      dom.style.color = 'var(--el-color-primary, #409eff)'
      dom.style.textDecoration = 'underline'
      dom.style.userSelect = 'none'
      dom.textContent = node.attrs.textContent || ''
      return { dom }
    }
  }
})

export default EventSpan
