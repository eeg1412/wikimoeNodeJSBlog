import { IButtonMenu, IDomEditor } from '@wangeditor/editor'
import { DomEditor } from '@wangeditor/core'
import { isInsertSpanDisabled } from '@/utils/editorMenu/utils'

class eventspanButtonMenu {
  constructor() {
    this.title = '添加活动' // 自定义菜单标题
    this.iconSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"/></svg>' // 可选
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
    return isInsertSpanDisabled(editor)
  }

  // 点击菜单时触发的函数
  exec(editor, value) {
    if (this.isDisabled(editor)) return
    if (!editor['openEventDialog']) return
    editor['openEventDialog'](editor)
  }
}

const menuConf = {
  key: 'eventspan', // 定义 menu key ：要保证唯一、不重复（重要）
  factory() {
    return new eventspanButtonMenu() // 把 `YourMenuClass` 替换为你菜单的 class
  }
}

export default menuConf
