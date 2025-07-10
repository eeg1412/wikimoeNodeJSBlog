/**
 * @description render elem
 */

import { h } from 'snabbdom'
import { DomEditor } from '@wangeditor/core'

function renderPanorama360(elem, children, editor, info) {
  // 当前节点是否选中
  const selected = DomEditor.isNodeSelected(editor, elem)
  let className = 'w-e-panorama360'
  if (selected) {
    className += ' w-e-selected'
  }

  const vnode = h(
    'div',
    {
      className: className
    },
    [
      h('img', {
        className: 'w-e-panorama360-img',
        src: elem.src,
        width: elem.width || '100%',
        height: elem.height || '400px',
        'data-href': elem.dataHref || '',
        'data-href-width': elem.dataHrefWidth || '',
        'data-href-height': elem.dataHrefHeight || '',
        alt: elem.alt || '360°全景图片',
        'data-type': 'panorama360'
      })
    ]
  )

  return vnode
}

const conf = {
  type: 'panorama360', // 节点 type ，重要！！！
  renderElem: renderPanorama360
}

export default conf
