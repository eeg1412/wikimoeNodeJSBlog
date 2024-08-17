/**
 * @description render elem
 */

import { h } from 'snabbdom'
import { DomEditor } from '@wangeditor/core'

function renderPhotoswiper (elem, children, editor, info) {
  // 当前节点是否选中
  console.log(elem)
  const id = elem.id || ''
  const name = elem.name || ''
  const width = elem.width || ''
  const height = elem.height || ''
  // 是否选中
  const selected = DomEditor.isNodeSelected(editor, elem)
  // 拼一个text
  const text = `相册幻灯片\nID: ${id}\n插入时的相册名: ${name}`
  const vnode = h(
    'div',
    {
      style: {
        "display": "flex",
        "justify-content": "center",
        "align-items": "center",
        "border": "1px solid #ccc",
        "padding": "10px 5px",
        "border-radius": "10px",
        "text-align": "center",
        "aspect-ratio": `${width}/${height}`,
        "box-sizing": "border-box",
        "background-color": "#f5f5f5",
        // 禁止选中文本
        "user-select": "none",
      },
      on: {
        mousedown: e => e.preventDefault(),
      },
      attrs: {
        "data-selected": selected ? 'true' : 'false',
      },
    },
    [
      { text: text }
    ]
  )

  return vnode
}

const conf = {
  type: 'photoswiper', // 节点 type ，重要！！！
  renderElem: renderPhotoswiper,
}

export default conf