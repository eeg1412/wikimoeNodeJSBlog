import { IButtonMenu, IDomEditor } from '@wangeditor/editor'
import { DomEditor } from '@wangeditor/core'
import { isInsertSpanDisabled } from '@/utils/editorMenu/utils'
import { Range, Node } from 'slate'

class panorama360ButtonMenu {
  constructor() {
    this.title = '插入360°全景图片'
    this.iconSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M45.6 32C20.4 32 0 52.4 0 77.6L0 434.4C0 459.6 20.4 480 45.6 480c5.1 0 10-.8 14.7-2.4C74.6 472.8 177.6 440 320 440s245.4 32.8 259.6 37.6c4.7 1.6 9.7 2.4 14.7 2.4c25.2 0 45.6-20.4 45.6-45.6l0-356.7C640 52.4 619.6 32 594.4 32c-5 0-10 .8-14.7 2.4C565.4 39.2 462.4 72 320 72S74.6 39.2 60.4 34.4C55.6 32.8 50.7 32 45.6 32zM96 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm272 0c7.9 0 15.4 3.9 19.8 10.5L512.3 353c5.4 8 5.6 18.4 .4 26.5s-14.7 12.3-24.2 10.7C442.7 382.4 385.2 376 320 376c-65.6 0-123.4 6.5-169.3 14.4c-9.8 1.7-19.7-2.9-24.7-11.5s-4.3-19.4 1.9-27.2L197.3 265c4.6-5.7 11.4-9 18.7-9s14.2 3.3 18.7 9l26.4 33.1 87-127.6c4.5-6.6 11.9-10.5 19.8-10.5z"/></svg>'
    this.tag = 'button'
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(editor) {
    return ''
  }

  // 菜单是否需要激活（如选中加粗文本，"加粗"菜单会激活），用不到则返回 false
  isActive(editor) {
    return false
  }

  // 菜单是否需要禁用（如选中 H1 ，"引用"菜单被禁用），用不到则返回 false
  isDisabled(editor) {
    const { selection } = editor
    if (selection == null) return true
    if (!Range.isCollapsed(selection)) return true // 选区非折叠，禁用

    const selectedElems = DomEditor.getSelectedElems(editor)
    const hasVoidOrPre = selectedElems.some((elem) => {
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
    editor['openAttachmentsDialog']('panorama360')
  }
}

const menuConf = {
  key: 'panorama360', // 定义 menu key ：要保证唯一、不重复（重要）
  factory() {
    return new panorama360ButtonMenu() // 把 `YourMenuClass` 替换为你菜单的 class
  },
}

export default menuConf
