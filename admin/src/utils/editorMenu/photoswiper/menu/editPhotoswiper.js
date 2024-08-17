import { DomEditor } from '@wangeditor/core'
import { SlateEditor, SlateElement, SlateNode } from '@wangeditor/editor'

class EditPhotoswiper {
  constructor() {
    this.title = '相册幻灯片'
    this.iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M160 80l352 0c8.8 0 16 7.2 16 16l0 224c0 8.8-7.2 16-16 16l-21.2 0L388.1 178.9c-4.4-6.8-12-10.9-20.1-10.9s-15.7 4.1-20.1 10.9l-52.2 79.8-12.4-16.9c-4.5-6.2-11.7-9.8-19.4-9.8s-14.8 3.6-19.4 9.8L175.6 336 160 336c-8.8 0-16-7.2-16-16l0-224c0-8.8 7.2-16 16-16zM96 96l0 224c0 35.3 28.7 64 64 64l352 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L160 32c-35.3 0-64 28.7-64 64zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120L0 344c0 75.1 60.9 136 136 136l320 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-320 0c-48.6 0-88-39.4-88-88l0-224zm208 24a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>'
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

    const photoswiperNode = DomEditor.getSelectedNodeByType(editor, 'photoswiper')
    console.log('photoswiperNode', photoswiperNode)
    if (photoswiperNode == null) {
      // 选区未处于 photoswiper node ，则禁用
      return true
    }
    return false
  }

  exec (editor, value) {
    if (this.isDisabled(editor)) return

    if (!editor['openPhotoswiperDialog']) return

    const nodeEntries = SlateEditor.nodes(editor, {
      match: (node) => {
        if (SlateElement.isElement(node)) {
          if (node.type === 'photoswiper') {
            return true
          }
        }
        return false
      },
      universal: true,
    })

    if (nodeEntries == null) {
      console.log('当前未选中的 photoswiper')
    } else {
      for (let nodeEntry of nodeEntries) {
        const [node, path] = nodeEntry
        editor['openPhotoswiperDialog'](editor, true, node)
      }
    }
  }
}

const editPhotoswiperConf = {
  key: 'editphotoswiper', // 定义 menu key ：要保证唯一、不重复（重要）
  factory () {
    return new EditPhotoswiper() // 把 `YourMenuClass` 替换为你菜单的 class
  },
}

export default editPhotoswiperConf