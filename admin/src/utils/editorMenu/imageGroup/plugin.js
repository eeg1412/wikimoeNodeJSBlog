import { DomEditor } from '@wangeditor/editor'
import { Editor, Node, Transforms } from 'slate'
function withImageGroup(editor) {
  const { isInline, isVoid, normalizeNode } = editor
  const newEditor = editor

  newEditor.isVoid = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'imageGroup') return true // 针对 type: imageGroup ，设置为 void
    return isVoid(elem)
  }

  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node)
    if (type === 'imageGroup') {
      const isLast = DomEditor.isLastNode(newEditor, node)
      if (isLast) {
        Transforms.insertNodes(newEditor, DomEditor.genEmptyParagraph(), {
          at: [path[0] + 1]
        })
      }
    }

    // // 如果链接内容为空，则删除
    // const str = Node.string(node)
    // if (str === '') {
    //   return Transforms.removeNodes(newEditor, { at: path })
    // }
    return normalizeNode([node, path])
  }

  return newEditor // 返回 newEditor ，重要！！！
}

export default withImageGroup
