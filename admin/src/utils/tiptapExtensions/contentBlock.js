import { Node, mergeAttributes } from '@tiptap/core'

/**
 * 内容块扩展 - 在富文本中嵌入番剧、电影、书籍、游戏、投票等内容引用
 * 块级、原子节点，不可编辑内部内容
 */

const BLOCK_TYPE_MAP = {
  bangumi: { label: '番剧', color: '#f472b6' },
  movie: { label: '电影', color: '#fb923c' },
  book: { label: '书籍', color: '#4ade80' },
  game: { label: '游戏', color: '#60a5fa' },
  vote: { label: '投票', color: '#a78bfa' }
}

const ContentBlock = Node.create({
  name: 'contentBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      blockType: { default: '' },
      blockId: { default: '' },
      blockTitle: { default: '' }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-content-block]',
        getAttrs: dom => ({
          blockType: dom.getAttribute('data-block-type') || '',
          blockId: dom.getAttribute('data-block-id') || '',
          blockTitle: dom.getAttribute('data-block-title') || ''
        })
      }
    ]
  },

  renderHTML({ node }) {
    const info = BLOCK_TYPE_MAP[node.attrs.blockType] || {
      label: node.attrs.blockType,
      color: '#999'
    }
    return [
      'div',
      mergeAttributes({
        'data-content-block': '',
        'data-block-type': node.attrs.blockType,
        'data-block-id': node.attrs.blockId,
        'data-block-title': node.attrs.blockTitle,
        style:
          'padding: 10px 14px; margin: 8px 0; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; display: flex; align-items: center; gap: 8px;'
      }),
      [
        'span',
        {
          style: `display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #fff; background: ${info.color}; flex-shrink: 0;`
        },
        info.label
      ],
      [
        'span',
        { style: 'font-size: 14px; color: #333;' },
        node.attrs.blockTitle || '未命名'
      ]
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-content-block', '')
      dom.setAttribute('data-block-type', node.attrs.blockType || '')
      dom.setAttribute('data-block-id', node.attrs.blockId || '')
      dom.style.padding = '10px 14px'
      dom.style.margin = '8px 0'
      dom.style.border = '1px solid #e0e0e0'
      dom.style.borderRadius = '6px'
      dom.style.background = '#fafafa'
      dom.style.display = 'flex'
      dom.style.alignItems = 'center'
      dom.style.gap = '8px'
      dom.style.userSelect = 'none'

      const info = BLOCK_TYPE_MAP[node.attrs.blockType] || {
        label: node.attrs.blockType || '未知',
        color: '#999'
      }

      const badge = document.createElement('span')
      badge.style.display = 'inline-block'
      badge.style.padding = '2px 8px'
      badge.style.borderRadius = '4px'
      badge.style.fontSize = '12px'
      badge.style.color = '#fff'
      badge.style.background = info.color
      badge.style.flexShrink = '0'
      badge.textContent = info.label

      const title = document.createElement('span')
      title.style.fontSize = '14px'
      title.style.color = '#333'
      title.textContent = node.attrs.blockTitle || '未命名'

      dom.appendChild(badge)
      dom.appendChild(title)

      return { dom }
    }
  }
})

export default ContentBlock
