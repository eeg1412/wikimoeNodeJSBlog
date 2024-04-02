import { Range, Editor } from 'slate'
import { DomEditor } from '@wangeditor/core'

export function isInsertSpanDisabled (editor) {
  const { selection } = editor
  if (selection == null) return true
  // if (!Range.isCollapsed(selection)) return true // 选区非折叠，禁用

  const [match] = Editor.nodes(editor, {
    match: n => {
      const type = DomEditor.getNodeType(n)

      if (type === 'code') return true // 代码块
      if (type === 'pre') return true // 代码块
      if (type === 'link') return true // 链接
      if (type === 'blockquote') return true // 引用
      if (type === 'image') return true  // 图片
      if (type === 'video') return true  // 视频
      if (type === 'eventspan') return true  // 活动
      if (Editor.isVoid(editor, n)) return true // void

      return false
    },
    universal: true,
  })

  if (match) return true
  return false
}