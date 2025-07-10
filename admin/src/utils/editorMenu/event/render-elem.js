/**
 * @description render elem
 */

import { h } from 'snabbdom'

function renderEventspan(elem, children, editor, info) {
  // 当前节点是否选中
  console.log(elem)
  const vnode = h(
    'span',
    {
      style: {
        cursor: 'pointer',
        color: 'var(--el-color-primary)',
      },
    },
    [{ text: elem.textContent }],
  )

  return vnode
}

const conf = {
  type: 'eventspan', // 节点 type ，重要！！！
  renderElem: renderEventspan,
}

export default conf
