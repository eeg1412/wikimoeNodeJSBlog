/**
 * @description render elem
 */

import { h } from 'snabbdom'

function renderEventspan (elem, children, editor) {
  // 当前节点是否选中
  console.log(children)
  const vnode = h(
    'span',
    {
      style: {
        cursor: 'pointer',
        color: 'var(--el-color-primary)',
      },
    },
    children
  )

  return vnode
}

const conf = {
  type: 'eventspan', // 节点 type ，重要！！！
  renderElem: renderEventspan,
}

export default conf