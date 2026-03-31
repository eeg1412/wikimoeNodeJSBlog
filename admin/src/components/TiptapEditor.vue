<template>
  <div class="editor-body tiptap-editor" :class="{ 'tiptap-fullscreen': isFullScreen }">
    <div class="tiptap-toolbar" v-if="editor">
      <!-- Row 1: Basic formatting -->
      <div class="tiptap-toolbar-row">
        <!-- Heading select -->
        <el-select
          :model-value="currentHeading"
          @change="setHeading"
          size="small"
          class="tiptap-toolbar-select"
          placeholder="正文"
        >
          <el-option label="正文" value="paragraph" />
          <el-option label="标题1" value="1" />
          <el-option label="标题2" value="2" />
          <el-option label="标题3" value="3" />
          <el-option label="标题4" value="4" />
          <el-option label="标题5" value="5" />
        </el-select>

        <el-divider direction="vertical" />

        <!-- Text style buttons -->
        <el-tooltip content="加粗" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()"
          >
            <b>B</b>
          </button>
        </el-tooltip>
        <el-tooltip content="斜体" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <i>I</i>
          </button>
        </el-tooltip>
        <el-tooltip content="下划线" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('underline') }"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <u>U</u>
          </button>
        </el-tooltip>
        <el-tooltip content="删除线" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('strike') }"
            @click="editor.chain().focus().toggleStrike().run()"
          >
            <s>S</s>
          </button>
        </el-tooltip>
        <el-tooltip content="行内代码" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('code') }"
            @click="editor.chain().focus().toggleCode().run()"
          >
            &lt;/&gt;
          </button>
        </el-tooltip>
        <el-tooltip content="上标" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('superscript') }"
            @click="editor.chain().focus().toggleSuperscript().run()"
          >
            X<sup>2</sup>
          </button>
        </el-tooltip>
        <el-tooltip content="下标" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('subscript') }"
            @click="editor.chain().focus().toggleSubscript().run()"
          >
            X<sub>2</sub>
          </button>
        </el-tooltip>
        <el-tooltip content="清除格式" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            @click="editor.chain().focus().unsetAllMarks().run()"
          >
            ✕
          </button>
        </el-tooltip>

        <el-divider direction="vertical" />

        <!-- Color -->
        <el-tooltip content="文字颜色" placement="top" :show-after="500">
          <el-color-picker
            :model-value="editor.getAttributes('textStyle').color || '#000000'"
            @change="val => editor.chain().focus().setColor(val).run()"
            size="small"
            class="tiptap-color-picker"
          />
        </el-tooltip>
        <el-tooltip content="背景颜色" placement="top" :show-after="500">
          <el-color-picker
            :model-value="
              editor.getAttributes('highlight').color || 'transparent'
            "
            @change="
              val =>
                editor.chain().focus().toggleHighlight({ color: val }).run()
            "
            size="small"
            class="tiptap-color-picker"
          />
        </el-tooltip>

        <el-divider direction="vertical" />

        <!-- Font size -->
        <el-select
          :model-value="currentFontSize"
          @change="setFontSize"
          size="small"
          class="tiptap-toolbar-select tiptap-toolbar-select-sm"
          placeholder="字号"
        >
          <el-option label="默认" value="" />
          <el-option label="12px" value="12px" />
          <el-option label="14px" value="14px" />
          <el-option label="16px" value="16px" />
          <el-option label="18px" value="18px" />
          <el-option label="20px" value="20px" />
          <el-option label="24px" value="24px" />
          <el-option label="28px" value="28px" />
          <el-option label="32px" value="32px" />
          <el-option label="36px" value="36px" />
        </el-select>

        <!-- Line height -->
        <el-select
          :model-value="currentLineHeight"
          @change="setLineHeight"
          size="small"
          class="tiptap-toolbar-select tiptap-toolbar-select-sm"
          placeholder="行高"
        >
          <el-option label="默认" value="" />
          <el-option label="1" value="1" />
          <el-option label="1.15" value="1.15" />
          <el-option label="1.5" value="1.5" />
          <el-option label="1.75" value="1.75" />
          <el-option label="2" value="2" />
          <el-option label="2.5" value="2.5" />
          <el-option label="3" value="3" />
        </el-select>

        <!-- Font family -->
        <el-select
          :model-value="currentFontFamily"
          @change="setFontFamily"
          size="small"
          class="tiptap-toolbar-select"
          placeholder="字体"
        >
          <el-option label="默认" value="" />
          <el-option label="黑体" value="SimHei" />
          <el-option label="宋体" value="SimSun" />
          <el-option label="楷体" value="KaiTi" />
          <el-option label="微软雅黑" value="Microsoft YaHei" />
          <el-option label="Arial" value="Arial" />
          <el-option label="Tahoma" value="Tahoma" />
          <el-option label="Verdana" value="Verdana" />
          <el-option label="Georgia" value="Georgia" />
          <el-option label="Times New Roman" value="Times New Roman" />
          <el-option label="Courier New" value="Courier New" />
        </el-select>
      </div>

      <!-- Row 2: Structure and media -->
      <div class="tiptap-toolbar-row">
        <el-tooltip content="引用" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('blockquote') }"
            @click="editor.chain().focus().toggleBlockquote().run()"
          >
            ❝
          </button>
        </el-tooltip>

        <el-tooltip content="无序列表" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('bulletList') }"
            @click="editor.chain().focus().toggleBulletList().run()"
          >
            ☰
          </button>
        </el-tooltip>
        <el-tooltip content="有序列表" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('orderedList') }"
            @click="editor.chain().focus().toggleOrderedList().run()"
          >
            1.
          </button>
        </el-tooltip>
        <el-tooltip content="任务列表" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('taskList') }"
            @click="editor.chain().focus().toggleTaskList().run()"
          >
            ☑
          </button>
        </el-tooltip>

        <el-divider direction="vertical" />

        <!-- Alignment -->
        <el-tooltip content="左对齐" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
            @click="editor.chain().focus().setTextAlign('left').run()"
          >
            ≡
          </button>
        </el-tooltip>
        <el-tooltip content="居中" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
            @click="editor.chain().focus().setTextAlign('center').run()"
          >
            ≡
          </button>
        </el-tooltip>
        <el-tooltip content="右对齐" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
            @click="editor.chain().focus().setTextAlign('right').run()"
          >
            ≡
          </button>
        </el-tooltip>
        <el-tooltip content="两端对齐" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
            @click="editor.chain().focus().setTextAlign('justify').run()"
          >
            ≡
          </button>
        </el-tooltip>

        <el-divider direction="vertical" />

        <!-- Indent -->
        <el-tooltip content="增加缩进" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            @click="editor.chain().focus().increaseIndent().run()"
          >
            →|
          </button>
        </el-tooltip>
        <el-tooltip content="减少缩进" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            @click="editor.chain().focus().decreaseIndent().run()"
          >
            |←
          </button>
        </el-tooltip>

        <el-divider direction="vertical" />

        <!-- Emoji popover -->
        <el-popover trigger="click" :width="300">
          <template #reference>
            <el-tooltip content="表情" placement="top" :show-after="500">
              <button class="tiptap-btn">😀</button>
            </el-tooltip>
          </template>
          <div class="tiptap-emoji-grid">
            <span
              v-for="emoji in emojiList"
              :key="emoji"
              class="tiptap-emoji-item"
              @click="insertEmoji(emoji)"
              >{{ emoji }}</span
            >
          </div>
        </el-popover>

        <!-- Link -->
        <el-tooltip content="链接" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': editor.isActive('link') }"
            @click="setLink"
          >
            🔗
          </button>
        </el-tooltip>

        <!-- Image buttons -->
        <el-tooltip content="上传图片" placement="top" :show-after="500">
          <button class="tiptap-btn" @click="openImageUpload">🖼️</button>
        </el-tooltip>
        <template v-if="isPost">
          <el-tooltip content="图片组" placement="top" :show-after="500">
            <button class="tiptap-btn" @click="openImageGroupUpload">
              🖼️+
            </button>
          </el-tooltip>
          <el-tooltip content="360°全景" placement="top" :show-after="500">
            <button class="tiptap-btn" @click="openPanorama360Upload">
              🌐
            </button>
          </el-tooltip>
        </template>

        <!-- Video buttons -->
        <el-tooltip content="上传视频" placement="top" :show-after="500">
          <button class="tiptap-btn" @click="openVideoUpload">🎬</button>
        </el-tooltip>
        <el-tooltip content="插入视频链接" placement="top" :show-after="500">
          <button class="tiptap-btn" @click="insertVideoUrl">📹</button>
        </el-tooltip>

        <el-divider direction="vertical" />

        <!-- Table -->
        <el-tooltip content="插入表格" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            @click="
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            "
          >
            ▦
          </button>
        </el-tooltip>

        <!-- Code block -->
        <el-popover trigger="click" :width="200">
          <template #reference>
            <el-tooltip content="代码块" placement="top" :show-after="500">
              <button
                class="tiptap-btn"
                :class="{ 'is-active': editor.isActive('codeBlock') }"
              >
                { }
              </button>
            </el-tooltip>
          </template>
          <div>
            <div
              v-for="lang in codeLangs"
              :key="lang.value"
              class="tiptap-code-lang-item"
              @click="insertCodeBlock(lang.value)"
            >
              {{ lang.text }}
            </div>
          </div>
        </el-popover>

        <!-- Divider -->
        <el-tooltip content="分割线" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            @click="editor.chain().focus().setHorizontalRule().run()"
          >
            ─
          </button>
        </el-tooltip>

        <el-divider direction="vertical" />

        <!-- Undo/Redo -->
        <el-tooltip content="撤销" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :disabled="!editor.can().undo()"
            @click="editor.chain().focus().undo().run()"
          >
            ↩
          </button>
        </el-tooltip>
        <el-tooltip content="重做" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :disabled="!editor.can().redo()"
            @click="editor.chain().focus().redo().run()"
          >
            ↪
          </button>
        </el-tooltip>

        <!-- Event span (only for posts) -->
        <template v-if="isPost">
          <el-divider direction="vertical" />
          <el-tooltip content="活动链接" placement="top" :show-after="500">
            <button class="tiptap-btn" @click="openEventDialog()">
              📅
            </button>
          </el-tooltip>
        </template>

        <el-divider direction="vertical" />

        <!-- Full screen -->
        <el-tooltip content="全屏" placement="top" :show-after="500">
          <button
            class="tiptap-btn"
            :class="{ 'is-active': isFullScreen }"
            @click="toggleFullScreen"
          >
            ⛶
          </button>
        </el-tooltip>
      </div>
    </div>

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
  shallowRef,
  onMounted,
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

import AttachmentsDialog from '@/components/AttachmentsDialog'
import RichEditorEventSelectorDialog from '@/components/RichEditorEventSelectorDialog'
import { ElMessage, ElMessageBox } from 'element-plus'
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
    AttachmentsDialog,
    RichEditorEventSelectorDialog
  },
  emits: ['update:contentJson', 'blur'],
  setup(props, { emit }) {
    const codeLangs = [
      { text: 'CSS', value: 'css' },
      { text: 'HTML', value: 'html' },
      { text: 'XML', value: 'xml' },
      { text: 'Javascript', value: 'javascript' },
      { text: 'Typescript', value: 'typescript' },
      { text: 'JSX', value: 'jsx' },
      { text: 'Go', value: 'go' },
      { text: 'PHP', value: 'php' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
      { text: 'C', value: 'c' },
      { text: 'C++', value: 'cpp' },
      { text: 'C#', value: 'csharp' },
      { text: 'Visual Basic', value: 'visual-basic' },
      { text: 'SQL', value: 'sql' },
      { text: 'Ruby', value: 'ruby' },
      { text: 'Swift', value: 'swift' },
      { text: 'Lua', value: 'lua' },
      { text: 'Groovy', value: 'groovy' },
      { text: 'Markdown', value: 'markdown' },
      { text: 'JSON', value: 'json' },
      { text: 'Bash', value: 'bash' },
      { text: 'sh', value: 'sh' }
    ]

    const emojiList =
      '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 😘 😗 😙 😚 😋 😛 😝 😜 🤓 😎 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 😢 😭 😤 😠 😡 😳 😱 😨 🤗 🤔 😶 😑 😬 🙄 😯 😴 😷 🤑 😈 🤡 💩 👻 💀 👀 👣 👐 🙌 👏'.split(
        ' '
      )

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
        Panorama360
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

    // Toolbar state computations
    const currentHeading = computed(() => {
      if (!editor.value) return 'paragraph'
      for (let i = 1; i <= 5; i++) {
        if (editor.value.isActive('heading', { level: i })) return String(i)
      }
      return 'paragraph'
    })

    const currentFontSize = computed(() => {
      if (!editor.value) return ''
      return editor.value.getAttributes('textStyle').fontSize || ''
    })

    const currentLineHeight = computed(() => {
      if (!editor.value) return ''
      // Check paragraph or heading
      const paraAttrs = editor.value.getAttributes('paragraph')
      const headAttrs = editor.value.getAttributes('heading')
      return paraAttrs.lineHeight || headAttrs.lineHeight || ''
    })

    const currentFontFamily = computed(() => {
      if (!editor.value) return ''
      return editor.value.getAttributes('textStyle').fontFamily || ''
    })

    const setHeading = val => {
      if (val === 'paragraph') {
        editor.value.chain().focus().setParagraph().run()
      } else {
        editor.value
          .chain()
          .focus()
          .toggleHeading({ level: parseInt(val) })
          .run()
      }
    }

    const setFontSize = val => {
      if (val) {
        editor.value.chain().focus().setFontSize(val).run()
      } else {
        editor.value.chain().focus().unsetFontSize().run()
      }
    }

    const setLineHeight = val => {
      if (val) {
        editor.value.chain().focus().setLineHeight(val).run()
      } else {
        editor.value.chain().focus().unsetLineHeight().run()
      }
    }

    const setFontFamily = val => {
      if (val) {
        editor.value.chain().focus().setFontFamily(val).run()
      } else {
        editor.value.chain().focus().unsetFontFamily().run()
      }
    }

    // Emoji
    const insertEmoji = emoji => {
      editor.value.chain().focus().insertContent(emoji).run()
    }

    // Link
    const setLink = () => {
      const previousUrl = editor.value.getAttributes('link').href
      ElMessageBox.prompt('请输入链接地址', '插入链接', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: previousUrl || 'https://',
        inputPattern: /\S+/,
        inputErrorMessage: '请输入有效链接'
      })
        .then(({ value }) => {
          if (value === null || value === '') {
            editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }
          editor.value
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: value })
            .run()
        })
        .catch(() => {})
    }

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

    // Code block
    const insertCodeBlock = language => {
      editor.value.chain().focus().toggleCodeBlock().run()
      if (language && editor.value.isActive('codeBlock')) {
        editor.value.chain().focus().updateAttributes('codeBlock', { language }).run()
      }
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

    // Full screen
    const isFullScreen = ref(false)
    const toggleFullScreen = () => {
      isFullScreen.value = !isFullScreen.value
    }

    return {
      editor,
      codeLangs,
      emojiList,
      currentHeading,
      currentFontSize,
      currentLineHeight,
      currentFontFamily,
      setHeading,
      setFontSize,
      setLineHeight,
      setFontFamily,
      insertEmoji,
      setLink,
      insertFnType,
      insertFnIs360Panorama,
      attachmentsDialogRef,
      openImageUpload,
      openImageGroupUpload,
      openPanorama360Upload,
      openVideoUpload,
      insertVideoUrl,
      selectAttachments,
      insertCodeBlock,
      showEventDialog,
      eventText,
      eventId,
      openEventDialog,
      onEventDialogOk,
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
.tiptap-toolbar {
  border-bottom: 1px solid #ccc;
  padding: 4px;
  background: #f5f5f5;
}
.tiptap-toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 2px 0;
}
.tiptap-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  padding: 0 4px;
  color: #333;
  transition: all 0.2s;
}
.tiptap-btn:hover {
  background: #e0e0e0;
}
.tiptap-btn.is-active {
  background: #d0d0d0;
  border-color: #bbb;
  color: var(--el-color-primary, #409eff);
}
.tiptap-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tiptap-toolbar-select {
  width: 90px;
}
.tiptap-toolbar-select-sm {
  width: 75px;
}
.tiptap-color-picker {
  vertical-align: middle;
}
.tiptap-emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}
.tiptap-emoji-item {
  cursor: pointer;
  font-size: 20px;
  padding: 2px;
  border-radius: 4px;
  transition: background 0.2s;
}
.tiptap-emoji-item:hover {
  background: #e0e0e0;
}
.tiptap-code-lang-item {
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
}
.tiptap-code-lang-item:hover {
  background: #e0e0e0;
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
