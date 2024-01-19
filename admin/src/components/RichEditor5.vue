<template>
  <div class="editor-body">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
    <AttachmentsDialog
      :shouldSelectOk="true"
      ref="attachmentsDialogRef"
      @selectAttachments="selectAttachments"
    />
  </div>
</template>

<script>
import { onBeforeUnmount, ref, shallowRef, onMounted, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import AttachmentsDialog from '@/components/AttachmentsDialog'
import { Boot, DomEditor, SlateTransforms } from '@wangeditor/editor'
import store from '@/store'

const imageToHtmlConf = {
  type: 'image',
  elemToHtml: (elemNode) => {
    const { src, alt = '', href = '', style = {}, width, height } = elemNode
    const { width: styWidth = '', height: styHeight = '' } = style

    let styleStr = ''
    if (styWidth) styleStr += `width: ${styWidth};`
    if (styHeight) styleStr += `height: ${styHeight};`
    return `<img src="${src}" alt="${alt}"${
      href ? ` data-href=${href}` : ''
    } width="${width}" height="${height}" style="${styleStr}"/>`
  },
}

export function getStyleValue($elem, styleKey) {
  let res = ''

  const styleStr = $elem.getAttribute('style') || '' // 如 'line-height: 2.5; color: red;'
  const styleArr = styleStr.split(';') // 如 ['line-height: 2.5', ' color: red', '']
  const length = styleArr.length
  for (let i = 0; i < length; i++) {
    const styleItemStr = styleArr[i] // 如 'line-height: 2.5'
    if (styleItemStr) {
      const arr = styleItemStr.split(':') // ['line-height', ' 2.5']
      if (arr[0].trim() === styleKey) {
        res = arr[1].trim()
      }
    }
  }

  return res
}

function parseImgHtml(elem, children, editor) {
  const $elem = elem
  let href = $elem.getAttribute('data-href') || ''
  href = decodeURIComponent(href) // 兼容 V4

  return {
    type: 'image',
    src: $elem.getAttribute('src') || '',
    alt: $elem.getAttribute('alt') || '',
    width: $elem.getAttribute('width') || '',
    height: $elem.getAttribute('height') || '',
    href,
    style: {
      width: getStyleValue($elem, 'width'),
      height: getStyleValue($elem, 'height'),
    },
    children: [{ text: '' }], // void node 有一个空白 text
  }
}

export const parseImgHtmlConf = {
  selector: 'img:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseImgHtml,
}
Boot.registerElemToHtml(imageToHtmlConf)
Boot.registerParseElemHtml(parseImgHtmlConf)

export default {
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  components: { Editor, Toolbar, AttachmentsDialog },
  setup(props, { emit }) {
    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    const valueHtml = computed({
      get() {
        return props.content
      },
      set(val) {
        emit('update:content', val)
      },
    })

    // 模拟 ajax 异步获取内容
    onMounted(() => {})

    const toolbarConfig = {
      toolbarKeys: [
        'headerSelect',
        'blockquote',
        '|',
        'bold',
        'underline',
        'italic',
        {
          key: 'group-more-style',
          title: '更多',
          iconSvg:
            '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
          menuKeys: ['through', 'code', 'sup', 'sub', 'clearStyle'],
        },
        'color',
        'bgColor',
        '|',
        'fontSize',
        'fontFamily',
        'lineHeight',
        '|',
        'bulletedList',
        'numberedList',
        'todo',
        {
          key: 'group-justify',
          title: '对齐',
          iconSvg:
            '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
          menuKeys: [
            'justifyLeft',
            'justifyRight',
            'justifyCenter',
            'justifyJustify',
          ],
        },
        {
          key: 'group-indent',
          title: '缩进',
          iconSvg:
            '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
          menuKeys: ['indent', 'delIndent'],
        },
        '|',
        'emotion',
        'insertLink',
        {
          key: 'group-image',
          title: '图片',
          iconSvg:
            '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
          menuKeys: ['insertImage', 'uploadImage'],
        },
        'insertVideo',
        'insertTable',
        'codeBlock',
        'divider',
        '|',
        'undo',
        'redo',
        '|',
        'fullScreen',
      ],
    }
    const editorConfig = {
      placeholder: '请输入内容...',
      autoFocus: false,
    }

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
      console.log(editor)
      const editorDom = editor.getEditableContainer()
      const { insertBreak } = editor
      // 检测shift+enter
      let isShiftEnter = false
      editorDom.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.keyCode === 13) {
          console.log('shift+enter')
          isShiftEnter = true
        }
      })
      // 重写 insertBreak
      editor.insertBreak = () => {
        console.log('insertBreak')
        if (isShiftEnter) {
          editor.dangerouslyInsertHtml('<br>')
        } else {
          insertBreak.call(editor)
        }
        isShiftEnter = false
      }

      const config = editor.getConfig()
      config.MENU_CONF['uploadImage'] = {
        // 自定义选择图片
        customBrowseAndUpload(insertFn) {
          console.log(insertFn)
          insertFn_ = insertFn
          openAttachmentsDialog()
        },
      }
      console.log(config)
    }

    let insertFn_ = null
    const attachmentsDialogRef = ref(null)
    const openAttachmentsDialog = () => {
      attachmentsDialogRef.value.open()
    }
    const siteUrl = computed(() => {
      return store.state.siteUrl
    })
    const selectAttachments = async (attachments) => {
      console.log(attachments)
      const editor = editorRef.value
      // let html = ''
      // attachments.forEach((item) => {
      //   // 写入img标签
      //   html += `<img src="${siteUrl.value + item.filepath}" alt="${
      //     item.filename
      //   }" width="${item.thumWidth || item.width}" height="${
      //     item.thumHeight || item.height
      //   }" loading="lazy" />`
      // })

      for (const item of attachments) {
        if (insertFn_) {
          const insertFnPromise = insertFn_(
            item.thumfor
              ? siteUrl.value + item.thumfor
              : siteUrl.value + item.filepath,
            item.filename,
            siteUrl.value + item.filepath
          )
          await insertFnPromise
          const editor = editorRef.value
          console.log(editor)
          SlateTransforms.setNodes(
            editor,
            {
              width: item.thumWidth || item.width,
              height: item.thumHeight || item.height,
            },
            {
              match: (n) => {
                return n.type === 'image'
              },
            }
          )
        }
      }
    }

    const handleBlur = () => {
      const editor = editorRef.value
      const toolbar = DomEditor.getToolbar(editor)
      console.log(JSON.stringify(toolbar.getConfig().toolbarKeys))
    }

    return {
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated,
      // 媒体库
      attachmentsDialogRef,
      openAttachmentsDialog,
      selectAttachments,
      handleBlur,
    }
  },
}
</script>
<style>
@import '@wangeditor/editor/dist/css/style.css';
</style>
<style scoped>
.editor-body {
  border: 1px solid #ccc;
  line-height: 1.15;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}
</style>
