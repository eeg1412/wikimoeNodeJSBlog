import { DomEditor } from '@wangeditor/editor'
import { Editor, Node, Transforms } from 'slate'
function withEventspan(editor) {
  const { isInline, isVoid, normalizeNode } = editor
  const newEditor = editor

  newEditor.isInline = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'eventspan') return true // 针对 type: eventspan ，设置为 inline
    return isInline(elem)
  }

  newEditor.isVoid = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'eventspan') return true // 针对 type: eventspan ，设置为 void
    return isVoid(elem)
  }

  // newEditor.normalizeNode = ([node, path]) => {
  //   const type = DomEditor.getNodeType(node)
  //   if (type !== 'eventspan') {
  //     // 未命中 ，执行默认的 normalizeNode
  //     return normalizeNode([node, path])
  //   }

  //   // 如果链接内容为空，则删除
  //   const str = Node.string(node)
  //   if (str === '') {
  //     return Transforms.removeNodes(newEditor, { at: path })
  //   }
  //   return normalizeNode([node, path])
  // }

  return newEditor // 返回 newEditor ，重要！！！
}

export default withEventspan
