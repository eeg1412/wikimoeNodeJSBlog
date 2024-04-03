import { Transforms } from 'slate'
import { DomEditor } from '@wangeditor/core'

class UnEventspan {
  constructor() {
    this.title = '取消活动'
    this.iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M128 0c13.3 0 24 10.7 24 24V64H296V24c0-13.3 10.7-24 24-24s24 10.7 24 24V64h40c35.3 0 64 28.7 64 64v16 48V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V192 144 128C0 92.7 28.7 64 64 64h40V24c0-13.3 10.7-24 24-24zM400 192H48V448c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V192zm-95 89l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>'
    this.tag = 'button'
  }

  getValue (editor) {
    // 无需获取 val
    return ''
  }

  isActive (editor) {
    // 无需 active
    return false
  }

  isDisabled (editor) {
    if (editor.selection == null) return true

    const eventspanNode = DomEditor.getSelectedNodeByType(editor, 'eventspan')
    console.log('eventspanNode', eventspanNode)
    if (eventspanNode == null) {
      // 选区未处于 eventspan node ，则禁用
      return true
    }
    return false
  }

  exec (editor, value) {
    if (this.isDisabled(editor)) return

    // 取消
    Transforms.unwrapNodes(editor, {
      match: n => n.type === 'eventspan',
      split: true
    });
  }
}

const unEventspanConf = {
  key: 'uneventspan', // 定义 menu key ：要保证唯一、不重复（重要）
  factory () {
    return new UnEventspan() // 把 `YourMenuClass` 替换为你菜单的 class
  },
}

export default unEventspanConf