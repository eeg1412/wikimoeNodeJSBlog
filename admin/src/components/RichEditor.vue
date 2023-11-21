<template>
  <div class="editor-body">
    <AttachmentsDialog
      :shouldSelectOk="true"
      ref="attachmentsDialogRef"
      @selectAttachments="selectAttachments"
    />
  </div>
</template>

<script>
import { onBeforeUnmount, ref, shallowRef, onMounted, computed } from 'vue'
import AttachmentsDialog from '@/components/AttachmentsDialog'

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

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const attachmentsDialogRef = ref(null)
    const openAttachmentsDialog = () => {
      attachmentsDialogRef.value.open()
    }
    const selectAttachments = (attachments) => {
      console.log(attachments)
      attachments.forEach((item) => {
        // TODO: 此处需要加上博客域名
      })
    }

    return {
      editorRef,
      valueHtml,
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
