/**
 * @description render elem
 */

import { h } from 'snabbdom'
import { IDomEditor, DomEditor } from '@wangeditor/core'

function renderImageGroup (elem, children, editor, info) {
  // 当前节点是否选中
  console.log(elem)
  const childrens = []
  // 遍历子节点的img标签
  elem.childrenList.forEach(child => {
    const item = h(
      'div',
      {
        className: 'w-e-image-group-img-body',
      },
      [h(
        'img',
        {
          className: 'w-e-image-group-img',
          src: child.src,
          width: child.width,
          height: child.height,
          'data-href': child.dataHref,
          'data-href-width': child.dataHrefWidth,
          'data-href-height': child.dataHrefHeight,
          alt: child.alt,
          text: '',
        }
      )]
    )
    childrens.push(item)
  })
  // 是否选中
  const selected = DomEditor.isNodeSelected(editor, elem)
  let className = 'w-e-image-group'
  // 根据 elem.childrenList 数量判断是单数还是双数
  if (elem.childrenList.length % 2 === 0) {
    className = 'w-e-image-group w-e-image-group-even'
  } else {
    className = 'w-e-image-group w-e-image-group-odd'
  }
  if (selected) {
    className += ' w-e-selected'
  }

  const vnode = h(
    'div',
    {
      className: className,
    },
    childrens
  )

  return vnode
}

const conf = {
  type: 'imageGroup', // 节点 type ，重要！！！
  renderElem: renderImageGroup,
}

export default conf