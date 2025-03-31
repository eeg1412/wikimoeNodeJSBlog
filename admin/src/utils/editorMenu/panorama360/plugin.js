/**
 * @description panorama360 plugin
 */

import { DomEditor } from '@wangeditor/core'
import { Transforms } from 'slate'

function withPanorama360 (editor) {
  const { isInline, isVoid, normalizeNode } = editor
  const newEditor = editor

  // 重写 isInline
  newEditor.isInline = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'panorama360') return false
    return isInline(elem)
  }

  // 重写 isVoid
  newEditor.isVoid = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'panorama360') return true
    return isVoid(elem)
  }

  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node)
    if (type === 'panorama360') {
      const isLast = DomEditor.isLastNode(newEditor, node)
      if (isLast) {
        Transforms.insertNodes(newEditor, DomEditor.genEmptyParagraph(), { at: [path[0] + 1] })
      }
    }
    return normalizeNode([node, path])
  }

  return newEditor // 返回 newEditor ，重要！！！
}

export default withPanorama360