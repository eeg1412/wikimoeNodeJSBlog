import { DomEditor } from '@wangeditor/core'
import { Transforms } from 'slate'

class imageWidthAutoButtonMenu {
  constructor() {
    this.title = 'auto' // 自定义菜单标题
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

  getSelectedNode(editor) {
    return DomEditor.getSelectedNodeByType(editor, 'image')
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor) {
    if (editor.selection == null) return true

    const imageNode = this.getSelectedNode(editor)
    if (imageNode == null) {
      // 选区未处于 image node ，则禁用
      return true
    }
    return false
  }

  // 点击菜单时触发的函数
  exec(editor, value) {
    if (this.isDisabled(editor)) return

    const imageNode = this.getSelectedNode(editor)
    if (imageNode == null) return

    // 隐藏 hoverbar
    const hoverbar = DomEditor.getHoverbar(editor)
    if (hoverbar) hoverbar.hideAndClean()

    const { style = {} } = imageNode
    const props = {
      style: {
        ...style,
        width: '', // 清空 width
        height: '', // 清空 height
      },
    }

    Transforms.setNodes(editor, props, {
      match: (n) => DomEditor.checkNodeType(n, 'image'),
    })
  }
}

const imageWidthAutoConf = {
  key: 'imageWidthauto', // 定义 menu key ：要保证唯一、不重复（重要）
  factory() {
    return new imageWidthAutoButtonMenu() // 把 `YourMenuClass` 替换为你菜单的 class
  },
}

export default imageWidthAutoConf
