import { IButtonMenu, IDomEditor } from '@wangeditor/editor'
import { DomEditor } from '@wangeditor/core'
import { isInsertSpanDisabled } from '@/utils/editorMenu/utils'
import { Range, Node } from 'slate'

class imageGroupButtonMenu {
  constructor() {
    this.title = '从媒体库插入图片组' // 自定义菜单标题
    this.iconSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M160 80l352 0c8.8 0 16 7.2 16 16l0 224c0 8.8-7.2 16-16 16l-21.2 0L388.1 178.9c-4.4-6.8-12-10.9-20.1-10.9s-15.7 4.1-20.1 10.9l-52.2 79.8-12.4-16.9c-4.5-6.2-11.7-9.8-19.4-9.8s-14.8 3.6-19.4 9.8L175.6 336 160 336c-8.8 0-16-7.2-16-16l0-224c0-8.8 7.2-16 16-16zM96 96l0 224c0 35.3 28.7 64 64 64l352 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L160 32c-35.3 0-64 28.7-64 64zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120L0 344c0 75.1 60.9 136 136 136l320 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-320 0c-48.6 0-88-39.4-88-88l0-224zm208 24a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>' // 可选
    this.tag = 'button'
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(editor) {
    return ''
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(editor) {
    return false
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor) {
    const { selection } = editor
    if (selection == null) return true
    if (!Range.isCollapsed(selection)) return true // 选区非折叠，禁用

    const selectedElems = DomEditor.getSelectedElems(editor)
    const hasVoidOrPre = selectedElems.some(elem => {
      const type = DomEditor.getNodeType(elem)
      if (type === 'pre') return true
      if (type === 'list-item') return true
      if (editor.isVoid(elem)) return true
      return false
    })
    if (hasVoidOrPre) return true // void 或 pre ，禁用

    return false
  }

  // 点击菜单时触发的函数
  exec(editor, value) {
    if (this.isDisabled(editor)) return
    if (!editor['openAttachmentsDialog']) return
    editor['openAttachmentsDialog']('imageGroup')
  }
}

const menuConf = {
  key: 'imageGroup', // 定义 menu key ：要保证唯一、不重复（重要）
  factory() {
    return new imageGroupButtonMenu() // 把 `YourMenuClass` 替换为你菜单的 class
  }
}

export default menuConf
