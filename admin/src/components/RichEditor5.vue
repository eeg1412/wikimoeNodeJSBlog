<template>
  <div class="editor-body richeditor-5">
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
      :typeList="[insertFnType]"
    />
    <RichEditorEventSelectorDialog
      v-model:show="showEventDialog"
      :text="eventText"
      @ok="onEventDialogOk"
    />
  </div>
</template>

<script>
import { onBeforeUnmount, ref, shallowRef, onMounted, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import AttachmentsDialog from '@/components/AttachmentsDialog'
import RichEditorEventSelectorDialog from '@/components/RichEditorEventSelectorDialog'
import { Boot, DomEditor, SlateTransforms } from '@wangeditor/editor'
import store from '@/store'

export default {
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  components: {
    Editor,
    Toolbar,
    AttachmentsDialog,
    RichEditorEventSelectorDialog,
  },
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
        {
          key: 'group-video',
          title: '视频',
          iconSvg:
            '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
          menuKeys: ['insertVideo', 'uploadVideo'],
        },
        'insertTable',
        'codeBlock',
        'divider',
        '|',
        'undo',
        'redo',
        '|',
        'eventspan',
        '|',
        'fullScreen',
      ],
    }
    const editorConfig = {
      placeholder: '请输入内容...',
      autoFocus: false,
      hoverbarKeys: {
        // key 即 element type
        link: {
          menuKeys: ['editLink', 'unLink', 'viewLink'],
        },
        image: {
          menuKeys: [
            'imageWidth30',
            'imageWidth50',
            'imageWidth100',
            'editImage',
            'viewImageLink',
            'deleteImage',
          ],
        },
        pre: {
          menuKeys: ['enter', 'codeBlock', 'codeSelectLang'],
        },
        table: {
          menuKeys: [
            'enter',
            'tableHeader',
            'tableFullWidth',
            'insertTableRow',
            'deleteTableRow',
            'insertTableCol',
            'deleteTableCol',
            'deleteTable',
          ],
        },
        divider: {
          menuKeys: ['enter'],
        },
        video: {
          menuKeys: ['enter', 'editVideoSize'],
        },
        eventspan: {
          menuKeys: ['uneventspan'],
        },
      },
    }

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
      editor['openEventDialog'] = openEventDialog
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
          insertFnType.value = 'image'
          openAttachmentsDialog()
        },
      }
      // 自定义上传视频
      config.MENU_CONF['uploadVideo'] = {
        // 自定义选择视频
        customBrowseAndUpload(insertFn) {
          console.log(insertFn)
          insertFn_ = insertFn
          insertFnType.value = 'video'
          openAttachmentsDialog()
        },
      }
      config.MENU_CONF['insertVideo'] = {
        onInsertedVideo(videoNode) {
          if (videoNode == null) return

          const { src } = videoNode
          console.log('inserted video', src)
        },
        checkVideo: (src, poster) => {
          if (!src) {
            return false
          }
          return true
        },
        parseVideoSrc: (videoSrc) => {
          if (videoSrc.indexOf('<iframe') !== -1) {
            // 如果是 iframe 形式，直接返回
            return videoSrc
          }
          if (videoSrc.indexOf('.bilibili.com') !== -1) {
            // 如果是，解析url里的bvid和p参数
            const url = new URL(videoSrc)
            const bvid =
              url.searchParams.get('bvid') || url.pathname.split('/')[2]
            const p = url.searchParams.get('p') || ''
            videoSrc = `<iframe src="https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${bvid}&p=${p}&as_wide=1&danmaku=0&hasMuteButton=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="1280" height="720" style="width: 100%; height: auto; aspect-ratio: 1280 / 720;"> </iframe>`
          }
          return videoSrc
        },
      }
      console.log(config)
    }

    let insertFn_ = null
    const insertFnType = ref(null)
    const attachmentsDialogRef = ref(null)
    const openAttachmentsDialog = () => {
      attachmentsDialogRef.value.open()
    }

    const siteUrl = computed(() => {
      return store.state.siteUrl
    })
    const getTime = () => {
      return new Date().getTime()
    }
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
          let insertFnPromise = null
          if (insertFnType.value === 'image') {
            insertFnPromise = insertFn_(
              item.thumfor
                ? `${siteUrl.value + item.thumfor}?t=${getTime()}`
                : `${siteUrl.value + item.filepath}?t=${getTime()}`,
              item.filename,
              `${siteUrl.value + item.filepath}?t=${getTime()}`
            )
          } else if (insertFnType.value === 'video') {
            insertFnPromise = insertFn_(
              `${siteUrl.value + item.filepath}?t=${getTime()}`,
              `${siteUrl.value + item.thumfor}?t=${getTime()}`
            )
          }

          await insertFnPromise
          const editor = editorRef.value
          console.log(editor)
          SlateTransforms.setNodes(
            editor,
            {
              width: item.thumWidth || item.width,
              height: item.thumHeight || item.height,
              hrefWidth: item.width,
              hrefHeight: item.height,
            },
            {
              match: (n) => {
                return n.type === 'image' || n.type === 'video'
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

    const showEventDialog = ref(false)
    const eventText = ref('')
    const openEventDialog = (editor) => {
      const text = editor.getSelectionText()
      eventText.value = text || ''
      showEventDialog.value = true
      // console.log(editor)
      // attachmentsDialogRef.value.open()
      // setTimeout(() => {
      //   editor.restoreSelection()
      //   const text = editor.getSelectionText()
      //   if (!text) return
      //   // 插入节点
      //   const eventspanElem = {
      //     type: 'eventspan',
      //     id: 'jfsjpsadjoifsjdf',
      //     children: [{ text: text }],
      //   }
      //   editor.insertNode(eventspanElem)
      // }, 5000)
    }
    const onEventDialogOk = (form) => {
      const editor = editorRef.value
      // 插入节点
      const eventspanElem = {
        type: 'eventspan',
        id: form.id,
        textContent: form.text,
        children: [{ text: form.text }],
      }
      editor.restoreSelection()
      editor.insertNode(eventspanElem)
    }

    return {
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated,
      // 媒体库
      insertFnType,
      attachmentsDialogRef,
      openAttachmentsDialog,
      selectAttachments,
      handleBlur,
      // 活动选择
      showEventDialog,
      eventText,
      openEventDialog,
      onEventDialogOk,
    }
  },
}
</script>
<style>
@import '@wangeditor/editor/dist/css/style.css';
.editor-body.richeditor-5 .w-e-modal {
  padding: 20px 15px 0;
}
.richeditor-5 .w-e-text-container [data-slate-editor] .w-e-image-container {
  margin: 0;
}
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
