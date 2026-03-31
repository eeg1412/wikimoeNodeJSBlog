<template>
  <div class="editor-body tiptap-editor" :class="{ 'tiptap-fullscreen': isFullScreen }">
    <TiptapToolbar
      :editor="editor"
      :isPost="isPost"
      :isFullScreen="isFullScreen"
      @open-image-upload="openImageUpload"
      @open-image-group-upload="openImageGroupUpload"
      @open-panorama360-upload="openPanorama360Upload"
      @open-video-upload="openVideoUpload"
      @insert-video-url="insertVideoUrl"
      @open-event-dialog="openEventDialog"
      @insert-content-block="onInsertContentBlock"
      @toggle-full-screen="toggleFullScreen"
    />

    <!-- Table controls when table is selected -->
    <div class="tiptap-table-controls" v-if="editor && editor.isActive('table')">
      <el-button size="small" @click="editor.chain().focus().addRowBefore().run()">上方插入行</el-button>
      <el-button size="small" @click="editor.chain().focus().addRowAfter().run()">下方插入行</el-button>
      <el-button size="small" @click="editor.chain().focus().deleteRow().run()">删除行</el-button>
      <el-button size="small" @click="editor.chain().focus().addColumnBefore().run()">左侧插入列</el-button>
      <el-button size="small" @click="editor.chain().focus().addColumnAfter().run()">右侧插入列</el-button>
      <el-button size="small" @click="editor.chain().focus().deleteColumn().run()">删除列</el-button>
      <el-button size="small" type="danger" @click="editor.chain().focus().deleteTable().run()">删除表格</el-button>
    </div>

    <!-- Editor content -->
    <editor-content :editor="editor" class="tiptap-content" />

    <!-- Attachments dialog -->
    <AttachmentsDialog
      :shouldSelectOk="true"
      ref="attachmentsDialogRef"
      @selectAttachments="selectAttachments"
      :hasDelete="false"
      :typeList="[insertFnType]"
      :is360Panorama="insertFnIs360Panorama"
    />

    <!-- Event selector dialog -->
    <RichEditorEventSelectorDialog
      v-model:show="showEventDialog"
      :text="eventText"
      :id="eventId"
      @ok="onEventDialogOk"
    />
  </div>
</template>

<script>
import {
  onBeforeUnmount,
  ref,
  computed,
  watch,
  nextTick
} from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'

// Custom extensions
import CustomImage from '@/utils/tiptapExtensions/customImage'
import Video from '@/utils/tiptapExtensions/video'
import EventSpan from '@/utils/tiptapExtensions/eventSpan'
import ImageGroup from '@/utils/tiptapExtensions/imageGroup'
import Panorama360 from '@/utils/tiptapExtensions/panorama360'
import FontSize from '@/utils/tiptapExtensions/fontSize'
import LineHeight from '@/utils/tiptapExtensions/lineHeight'
import Indent from '@/utils/tiptapExtensions/indent'
import ContentBlock from '@/utils/tiptapExtensions/contentBlock'

import TiptapToolbar from '@/components/TiptapToolbar'
import AttachmentsDialog from '@/components/AttachmentsDialog'
import RichEditorEventSelectorDialog from '@/components/RichEditorEventSelectorDialog'
import { ElMessageBox } from 'element-plus'
import store from '@/store'

export default {
  name: 'TiptapEditor',
  props: {
    contentJson: {
      type: Object,
      default: null
    },
    isPost: {
      type: Boolean,
      default: false
    }
  },
  components: {
    EditorContent,
    TiptapToolbar,
    AttachmentsDialog,
    RichEditorEventSelectorDialog
  },
  emits: ['update:contentJson', 'blur', 'insert-content-block'],
  setup(props, { emit }) {
    const siteUrl = computed(() => {
      return store.state.siteUrl
    })

    const getTime = () => {
      return new Date().getTime()
    }

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: {
            languageClassPrefix: 'language-'
          }
        }),
        Underline,
        Superscript,
        Subscript,
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        TextStyle,
        Color,
        Highlight.configure({
          multicolor: true
        }),
        FontFamily,
        FontSize,
        LineHeight,
        Indent,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer nofollow'
          }
        }),
        CustomImage.configure({
          inline: false,
          allowBase64: false
        }),
        Video,
        Table.configure({
          resizable: true
        }),
        TableRow,
        TableCell,
        TableHeader,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        Placeholder.configure({
          placeholder: '请输入内容...'
        }),
        EventSpan,
        ImageGroup,
        Panorama360,
        ContentBlock
      ],
      content: props.contentJson || { type: 'doc', content: [{ type: 'paragraph' }] },
      onUpdate: ({ editor: ed }) => {
        emit('update:contentJson', ed.getJSON())
      },
      onBlur: () => {
        emit('blur')
      }
    })

    // Watch for external contentJson changes
    watch(
      () => props.contentJson,
      newVal => {
        if (!editor.value) return
        const currentJson = JSON.stringify(editor.value.getJSON())
        const newJson = JSON.stringify(newVal)
        if (currentJson !== newJson && newVal) {
          editor.value.commands.setContent(newVal, false)
        }
      },
      { deep: true }
    )

    onBeforeUnmount(() => {
      if (editor.value) {
        editor.value.destroy()
      }
    })

    // Image upload
    const insertFnType = ref('image')
    const insertFnIs360Panorama = ref(false)
    const attachmentsDialogRef = ref(null)
    const openAttachmentsDialogType = ref('')

    const openImageUpload = () => {
      insertFnType.value = 'image'
      insertFnIs360Panorama.value = false
      openAttachmentsDialogType.value = 'image'
      nextTick(() => {
        attachmentsDialogRef.value.open()
      })
    }

    const openImageGroupUpload = () => {
      insertFnType.value = 'image'
      insertFnIs360Panorama.value = false
      openAttachmentsDialogType.value = 'imageGroup'
      nextTick(() => {
        attachmentsDialogRef.value.open()
      })
    }

    const openPanorama360Upload = () => {
      insertFnType.value = 'image'
      insertFnIs360Panorama.value = true
      openAttachmentsDialogType.value = 'panorama360'
      nextTick(() => {
        attachmentsDialogRef.value.open()
      })
    }

    const openVideoUpload = () => {
      insertFnType.value = 'video'
      insertFnIs360Panorama.value = false
      openAttachmentsDialogType.value = 'video'
      nextTick(() => {
        attachmentsDialogRef.value.open()
      })
    }

    const insertVideoUrl = () => {
      ElMessageBox.prompt('请输入视频地址或Bilibili链接', '插入视频', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: '',
        inputPlaceholder: 'https://...'
      })
        .then(({ value }) => {
          if (!value) return
          let videoSrc = value
          if (value.indexOf('<iframe') !== -1) {
            videoSrc = value
          } else if (value.indexOf('.bilibili.com') !== -1) {
            const url = new URL(value)
            const bvid =
              url.searchParams.get('bvid') || url.pathname.split('/')[2]
            const p = url.searchParams.get('p') || ''
            videoSrc = `<iframe src="https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${bvid}&p=${p}&as_wide=1&danmaku=0&hasMuteButton=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="1280" height="720" style="width: 100%; height: auto; aspect-ratio: 1280 / 720;"> </iframe>`
          }
          editor.value
            .chain()
            .focus()
            .insertContent({
              type: 'video',
              attrs: { src: videoSrc }
            })
            .run()
        })
        .catch(() => {})
    }

    const selectAttachments = attachments => {
      if (!attachments || attachments.length === 0) return

      if (openAttachmentsDialogType.value === 'imageGroup') {
        const childrenList = attachments.map(item => ({
          src: item.thumfor
            ? `${siteUrl.value + item.thumfor}?t=${getTime()}`
            : `${siteUrl.value + item.filepath}?t=${getTime()}`,
          width: item.thumWidth || item.width,
          height: item.thumHeight || item.height,
          dataHref: `${siteUrl.value + item.filepath}?t=${getTime()}`,
          dataHrefWidth: item.width,
          dataHrefHeight: item.height,
          alt: item.description || item.filename || ''
        }))
        editor.value
          .chain()
          .focus()
          .insertContent({
            type: 'imageGroup',
            attrs: { childrenList }
          })
          .run()
      } else if (openAttachmentsDialogType.value === 'panorama360') {
        attachments.forEach(item => {
          editor.value
            .chain()
            .focus()
            .insertContent({
              type: 'panorama360',
              attrs: {
                src: item.thumfor
                  ? `${siteUrl.value + item.thumfor}?t=${getTime()}`
                  : `${siteUrl.value + item.filepath}?t=${getTime()}`,
                width: item.thumWidth || item.width || '100%',
                height: item.thumHeight || item.height || '400px',
                dataHref: item.filepath
                  ? `${siteUrl.value + item.filepath}?t=${getTime()}`
                  : '',
                dataHrefWidth: item.width || '',
                dataHrefHeight: item.height || '',
                alt: item.description || item.filename || '360°全景图片'
              }
            })
            .run()
        })
      } else if (openAttachmentsDialogType.value === 'video') {
        attachments.forEach(item => {
          editor.value
            .chain()
            .focus()
            .insertContent({
              type: 'video',
              attrs: {
                src: `${siteUrl.value + item.filepath}?t=${getTime()}`,
                poster: item.thumfor
                  ? `${siteUrl.value + item.thumfor}?t=${getTime()}`
                  : '',
                width: item.width || '',
                height: item.height || ''
              }
            })
            .run()
        })
      } else {
        // Regular image upload
        attachments.forEach(item => {
          editor.value
            .chain()
            .focus()
            .insertContent({
              type: 'image',
              attrs: {
                src: item.thumfor
                  ? `${siteUrl.value + item.thumfor}?t=${getTime()}`
                  : `${siteUrl.value + item.filepath}?t=${getTime()}`,
                alt: item.description || item.filename || '',
                width: item.thumWidth || item.width || null,
                height: item.thumHeight || item.height || null,
                dataHref: `${siteUrl.value + item.filepath}?t=${getTime()}`,
                dataHrefWidth: item.width || null,
                dataHrefHeight: item.height || null
              }
            })
            .run()
        })
      }
      openAttachmentsDialogType.value = ''
    }

    // Event span
    const showEventDialog = ref(false)
    const eventText = ref('')
    const eventId = ref(null)

    const openEventDialog = () => {
      const { from, to } = editor.value.state.selection
      const text = editor.value.state.doc.textBetween(from, to, '')
      eventText.value = text || ''
      eventId.value = null
      showEventDialog.value = true
    }

    const onEventDialogOk = form => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: 'eventspan',
          attrs: {
            id: form.id,
            textContent: form.text
          }
        })
        .run()
    }

    // Content block insertion
    const onInsertContentBlock = (blockType) => {
      emit('insert-content-block', blockType)
    }

    const insertContentBlock = (blockType, blockId, blockTitle) => {
      if (!editor.value) return
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: 'contentBlock',
          attrs: {
            blockType: blockType,
            blockId: blockId,
            blockTitle: blockTitle
          }
        })
        .run()
    }

    // Full screen
    const isFullScreen = ref(false)
    const toggleFullScreen = () => {
      isFullScreen.value = !isFullScreen.value
    }

    return {
      editor,
      insertFnType,
      insertFnIs360Panorama,
      attachmentsDialogRef,
      openImageUpload,
      openImageGroupUpload,
      openPanorama360Upload,
      openVideoUpload,
      insertVideoUrl,
      selectAttachments,
      showEventDialog,
      eventText,
      eventId,
      openEventDialog,
      onEventDialogOk,
      onInsertContentBlock,
      insertContentBlock,
      isFullScreen,
      toggleFullScreen
    }
  }
}
</script>

<style>
.tiptap-editor {
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}
.tiptap-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.tiptap-fullscreen .tiptap-content {
  flex: 1;
  overflow-y: auto;
}
.tiptap-fullscreen .tiptap-content .tiptap {
  min-height: 100%;
}
.tiptap-table-controls {
  padding: 4px 8px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
/* Editor content styles */
.tiptap-content .tiptap {
  padding: 10px 15px;
  min-height: 500px;
  outline: none;
  overflow-y: auto;
}
.tiptap-content .tiptap > * + * {
  margin-top: 0.5em;
}
.tiptap-content .tiptap h1 {
  font-size: 2em;
  font-weight: bold;
}
.tiptap-content .tiptap h2 {
  font-size: 1.5em;
  font-weight: bold;
}
.tiptap-content .tiptap h3 {
  font-size: 1.17em;
  font-weight: bold;
}
.tiptap-content .tiptap h4 {
  font-size: 1em;
  font-weight: bold;
}
.tiptap-content .tiptap h5 {
  font-size: 0.83em;
  font-weight: bold;
}
.tiptap-content .tiptap blockquote {
  border-left: 3px solid #ccc;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
}
.tiptap-content .tiptap ul {
  list-style: disc;
  padding-left: 1.5em;
}
.tiptap-content .tiptap ol {
  list-style: decimal;
  padding-left: 1.5em;
}
.tiptap-content .tiptap ul[data-type='taskList'] {
  list-style: none;
  padding-left: 0;
}
.tiptap-content .tiptap ul[data-type='taskList'] li {
  display: flex;
  align-items: flex-start;
}
.tiptap-content .tiptap ul[data-type='taskList'] li > label {
  margin-right: 0.5em;
}
.tiptap-content .tiptap pre {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
}
.tiptap-content .tiptap pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
}
.tiptap-content .tiptap code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}
.tiptap-content .tiptap img {
  max-width: 100%;
  height: auto;
}
.tiptap-content .tiptap hr {
  border: none;
  border-top: 2px solid #ccc;
  margin: 1em 0;
}
.tiptap-content .tiptap a {
  color: var(--el-color-primary, #409eff);
  text-decoration: underline;
}
/* Table styles */
.tiptap-content .tiptap table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
.tiptap-content .tiptap th,
.tiptap-content .tiptap td {
  border: 1px solid #ccc;
  padding: 6px 10px;
  min-width: 100px;
}
.tiptap-content .tiptap th {
  background: #f5f5f5;
  font-weight: bold;
}
/* Image group styles */
.tiptap-content .w-e-image-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tiptap-content .w-e-image-group-img-body {
  flex: 1 1 calc(50% - 4px);
  min-width: 100px;
}
.tiptap-content .w-e-image-group-img {
  width: 100%;
  height: auto;
  display: block;
}
.tiptap-content .w-e-image-group-odd .w-e-image-group-img-body:last-child {
  flex: 1 1 100%;
}
/* Panorama styles */
.tiptap-content .w-e-panorama360 {
  position: relative;
  width: 100%;
}
.tiptap-content .w-e-panorama360-img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
}
/* Placeholder */
.tiptap-content .tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
