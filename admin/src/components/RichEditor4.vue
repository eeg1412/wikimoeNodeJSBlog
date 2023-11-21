<template>
  <div class="editor-body">
    <div ref="editorRef"></div>
    <AttachmentsDialog
      :shouldSelectOk="true"
      ref="attachmentsDialogRef"
      @selectAttachments="selectAttachments"
    />
  </div>
</template>

<script>
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  onMounted,
  computed,
  watch,
} from 'vue'
import AttachmentsDialog from '@/components/AttachmentsDialog'
import E from 'wangeditor'

export default {
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  components: { AttachmentsDialog },
  setup(props, { emit }) {
    // 编辑器实例，必须用 shallowRef
    const editorRef = ref()

    const attachmentsDialogRef = ref(null)
    const openAttachmentsDialog = () => {
      attachmentsDialogRef.value.open()
    }
    const selectAttachments = (attachments) => {
      console.log(attachments)
      attachments.forEach((item) => {
        // TODO: 此处需要加上博客域名
        // TODO: v4版本的data-href需要uri解码
        editor.cmd.do(
          'insertHTML',
          `<img src="${item.thumfor || item.filepath}" data-href="${
            item.filepath
          }" />`
        )
      })
    }

    let editor = null
    const initEditor = () => {
      editor = new E(editorRef.value)
      editor.config.height = 500
      editor.config.uploadImgFromMedia = function () {
        openAttachmentsDialog()
      }
      editor.create()
      editor.txt.html(props.content)
      let sendHtmlTimeout = null
      editor.config.onchange = (newHtml) => {
        if (sendHtmlTimeout) {
          clearTimeout(sendHtmlTimeout)
        }
        sendHtmlTimeout = setTimeout(() => {
          emit('update:content', newHtml)
        }, 100)
      }
    }

    onMounted(() => {
      initEditor()
    })

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      if (editor) {
        editor.destroy()
        console.log('editor destroyed')
      }
    })

    return {
      editorRef,
      // 媒体库
      attachmentsDialogRef,
      openAttachmentsDialog,
      selectAttachments,
    }
  },
}
</script>
<style scoped>
.editor-body {
  border: 1px solid #ccc;
  line-height: 1.15;
  z-index: 2;
  width: 100%;
}
</style>
