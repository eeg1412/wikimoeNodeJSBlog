import { DomEditor, SlateTransforms } from '@wangeditor/editor'
import { Editor, Node, Transforms } from 'slate'
function withPhotoswiper (editor) {
  const { isVoid, isInline, normalizeNode } = editor
  const newEditor = editor

  newEditor.isVoid = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'photoswiper') return true // 针对 type: photoswiper ，设置为 void
    return isVoid(elem)
  }

  // 重新 normalize
  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node)
    if (type !== 'photoswiper') {
      // 未命中 photoswiper ，执行默认的 normalizeNode
      return normalizeNode([node, path])
    }

    // editor 顶级 node
    const topLevelNodes = newEditor.children || []

    // --------------------- photoswiper 后面必须跟一个 p header blockquote（否则后面无法继续输入文字） ---------------------
    const nextNode = topLevelNodes[path[0] + 1] || {}
    const nextNodeType = DomEditor.getNodeType(nextNode)
    if (
      nextNodeType !== 'paragraph' &&
      nextNodeType !== 'blockquote' &&
      !nextNodeType.startsWith('header')
    ) {
      // photoswiper node 后面不是 p 或 header ，则插入一个空 p
      const p = { type: 'paragraph', children: [{ text: '' }] }
      const insertPath = [path[0] + 1]
      SlateTransforms.insertNodes(newEditor, p, {
        at: insertPath, // 在 photoswiper 后面插入
      })
    }
  }



  return newEditor // 返回 newEditor ，重要！！！
}

export default withPhotoswiper