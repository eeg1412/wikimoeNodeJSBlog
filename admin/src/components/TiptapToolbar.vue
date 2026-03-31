<template>
  <div class="tiptap-toolbar" v-if="editor" :data-state="editorState">
    <div
      v-for="(row, rowIndex) in renderedRows"
      :key="rowIndex"
      class="tiptap-toolbar-row"
    >
      <template v-for="(item, itemIndex) in row" :key="item.name || itemIndex">
        <!-- Divider -->
        <el-divider
          v-if="item.type === 'divider'"
          direction="vertical"
        />

        <!-- Select -->
        <el-select
          v-else-if="item.type === 'select'"
          :model-value="getSelectValue(item)"
          @change="val => handleSelectChange(item, val)"
          size="small"
          :class="item.className"
          :placeholder="item.placeholder"
        >
          <el-option
            v-for="opt in item.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <!-- Color Picker -->
        <el-tooltip
          v-else-if="item.type === 'color'"
          :content="item.tooltip"
          placement="top"
          :show-after="500"
        >
          <el-color-picker
            :model-value="getColorValue(item)"
            @change="val => handleColorChange(item, val)"
            size="small"
            class="tiptap-color-picker"
          />
        </el-tooltip>

        <!-- Group (Popover dropdown) -->
        <el-popover
          v-else-if="item.type === 'group'"
          trigger="click"
          :width="item.popoverWidth || 'auto'"
          popper-class="tiptap-group-popper"
        >
          <template #reference>
            <el-tooltip
              :content="item.tooltip"
              placement="top"
              :show-after="500"
            >
              <button
                class="tiptap-btn tiptap-btn-group"
                :class="{ 'is-active': checkGroupActive(item) }"
              >
                <span
                  v-if="item.icon && item.icon.type === 'svg'"
                  class="tiptap-icon"
                  v-html="item.icon.content"
                ></span>
                <el-icon v-else-if="item.icon && item.icon.type === 'component'">
                  <component :is="item.icon.name" />
                </el-icon>
                <span class="tiptap-group-arrow">▾</span>
              </button>
            </el-tooltip>
          </template>
          <div class="tiptap-group-dropdown">
            <button
              v-for="(subItem, subIndex) in getGroupItems(item)"
              :key="subItem.name || subIndex"
              class="tiptap-group-item"
              :class="{ 'is-active': checkActive(subItem) }"
              :disabled="checkDisabled(subItem)"
              @click="handleAction(subItem)"
            >
              <span
                v-if="subItem.icon && subItem.icon.type === 'svg'"
                class="tiptap-icon"
                v-html="subItem.icon.content"
              ></span>
              <el-icon v-else-if="subItem.icon && subItem.icon.type === 'component'">
                <component :is="subItem.icon.name" />
              </el-icon>
              <span class="tiptap-group-item-label">{{ subItem.tooltip }}</span>
            </button>
          </div>
        </el-popover>

        <!-- Emoji Popover -->
        <el-popover
          v-else-if="item.type === 'emoji'"
          trigger="click"
          :width="300"
        >
          <template #reference>
            <el-tooltip
              :content="item.tooltip"
              placement="top"
              :show-after="500"
            >
              <button class="tiptap-btn">
                <span
                  class="tiptap-icon"
                  v-html="item.icon.content"
                ></span>
              </button>
            </el-tooltip>
          </template>
          <div class="tiptap-emoji-grid">
            <span
              v-for="emoji in emojiList"
              :key="emoji"
              class="tiptap-emoji-item"
              @click="insertEmoji(emoji)"
            >{{ emoji }}</span>
          </div>
        </el-popover>

        <!-- Regular Button -->
        <el-tooltip
          v-else-if="item.type === 'button'"
          :content="item.tooltip"
          placement="top"
          :show-after="500"
        >
          <button
            class="tiptap-btn"
            :class="{ 'is-active': checkActive(item) }"
            :disabled="checkDisabled(item)"
            @click="handleAction(item)"
          >
            <span
              v-if="item.icon && item.icon.type === 'svg'"
              class="tiptap-icon"
              v-html="item.icon.content"
            ></span>
            <el-icon v-else-if="item.icon && item.icon.type === 'component'">
              <component :is="item.icon.name" />
            </el-icon>
          </button>
        </el-tooltip>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { ElMessageBox } from 'element-plus'

// SVG icon definitions
const SVG_ICONS = {
  bold: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>',
  italic: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
  underline: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
  strike: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>',
  inlineCode: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  superscript: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.96 6h-2.62l-3.2 5.15h-.12L8.85 6H6.19l4.47 6.73L5.88 20z"/><path fill="currentColor" d="M21.05 9.28h-2.83V8.6l1.2-1.04c.27-.24.45-.43.55-.57.09-.13.14-.28.14-.45 0-.19-.06-.34-.19-.44-.13-.1-.29-.15-.49-.15-.22 0-.4.06-.54.19s-.2.3-.2.54h-1.14c.01-.41.16-.74.44-1s.66-.38 1.14-.38c.5 0 .9.12 1.19.36s.44.57.44.99c0 .26-.07.51-.22.76s-.44.55-.86.92l-.57.5v.03h1.86v.84z"/></svg>',
  subscript: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.96 4h-2.62l-3.2 5.15h-.12L8.85 4H6.19l4.47 6.73L5.88 18z"/><path fill="currentColor" d="M21.05 22.28h-2.83v-.68l1.2-1.04c.27-.24.45-.43.55-.57.09-.13.14-.28.14-.45 0-.19-.06-.34-.19-.44-.13-.1-.29-.15-.49-.15-.22 0-.4.06-.54.19s-.2.3-.2.54h-1.14c.01-.41.16-.74.44-1s.66-.38 1.14-.38c.5 0 .9.12 1.19.36s.44.57.44.99c0 .26-.07.51-.22.76s-.44.55-.86.92l-.57.5v.03h1.86v.84z"/></svg>',
  clearFormat: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/></svg>',
  quote: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
  bulletList: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
  orderedList: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>',
  taskList: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M22 7h-9v2h9V7zm0 4h-9v2h9v-2zm0 4h-9v2h9v-2zM5.54 11L2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"/></svg>',
  alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>',
  alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>',
  alignRight: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>',
  alignJustify: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zM3 3v2h18V3H3z"/></svg>',
  indent: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
  outdent: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
  emoji: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>',
  table: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/></svg>',
  codeBlock: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  hr: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 11h20v2H2z"/></svg>',
  moreStyles: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',
  contentBlock: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/></svg>',
  bangumi: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6V7h2v10zm10 0h-2V7h2v10z"/></svg>',
  movie: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
  book: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
  game: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
  vote: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-3.54-3.54 4.95-4.95L17 7.95zm-4.24-5.66L6.39 8.66a.996.996 0 0 0 0 1.41l4.95 4.95c.39.39 1.02.39 1.41 0l6.36-6.36a.996.996 0 0 0 0-1.41l-4.95-4.95a.996.996 0 0 0-1.41 0z"/></svg>'
}

function svg (name) {
  return { type: 'svg', content: SVG_ICONS[name] }
}

function icon (name) {
  return { type: 'component', name: name }
}

export default {
  name: 'TiptapToolbar',
  props: {
    editor: {
      type: Object,
      default: null
    },
    isPost: {
      type: Boolean,
      default: false
    },
    isFullScreen: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'open-image-upload',
    'open-image-group-upload',
    'open-panorama360-upload',
    'open-video-upload',
    'insert-video-url',
    'open-event-dialog',
    'insert-content-block',
    'toggle-full-screen'
  ],
  setup (props, { emit }) {
    // Reactivity: track editor transactions to force re-render
    const editorState = ref(0)
    let unlistenTransaction = null

    const bindEditorEvents = (ed) => {
      if (unlistenTransaction) {
        unlistenTransaction()
        unlistenTransaction = null
      }
      if (ed) {
        const handler = () => { editorState.value++ }
        ed.on('transaction', handler)
        unlistenTransaction = () => { ed.off('transaction', handler) }
      }
    }

    watch(() => props.editor, (newEditor) => {
      bindEditorEvents(newEditor)
    }, { immediate: true })

    onBeforeUnmount(() => {
      if (unlistenTransaction) {
        unlistenTransaction()
      }
    })

    // Emoji list
    const emojiList =
      '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 😘 😗 😙 😚 😋 😛 😝 😜 🤓 😎 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 😢 😭 😤 😠 😡 😳 😱 😨 🤗 🤔 😶 😑 😬 🙄 😯 😴 😷 🤑 😈 🤡 💩 👻 💀 👀 👣 👐 🙌 👏'.split(' ')

    // Code languages
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

    // Internal editor command helpers
    const insertEmoji = (emoji) => {
      if (props.editor) {
        props.editor.chain().focus().insertContent(emoji).run()
      }
    }

    const setLink = () => {
      if (!props.editor) return
      const previousUrl = props.editor.getAttributes('link').href
      ElMessageBox.prompt('请输入链接地址', '插入链接', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: previousUrl || 'https://',
        inputPattern: /\S+/,
        inputErrorMessage: '请输入有效链接'
      })
        .then(({ value }) => {
          if (value === null || value === '') {
            props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }
          props.editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: value })
            .run()
        })
        .catch(() => {})
    }

    const insertCodeBlock = (language) => {
      if (!props.editor) return
      props.editor.chain().focus().toggleCodeBlock().run()
      if (language && props.editor.isActive('codeBlock')) {
        props.editor
          .chain()
          .focus()
          .updateAttributes('codeBlock', { language })
          .run()
      }
    }

    // --- Toolbar configuration ---
    const toolbarRows = [
      // Row 1: Heading, basic formatting, colors, font settings
      [
        {
          type: 'select',
          name: 'heading',
          placeholder: '正文',
          className: 'tiptap-toolbar-select',
          options: [
            { label: '正文', value: 'paragraph' },
            { label: '标题1', value: '1' },
            { label: '标题2', value: '2' },
            { label: '标题3', value: '3' },
            { label: '标题4', value: '4' },
            { label: '标题5', value: '5' }
          ],
          getValue: (ed) => {
            for (let i = 1; i <= 5; i++) {
              if (ed.isActive('heading', { level: i })) return String(i)
            }
            return 'paragraph'
          },
          onChange: (ed, val) => {
            if (val === 'paragraph') {
              ed.chain().focus().setParagraph().run()
            } else {
              ed.chain().focus().toggleHeading({ level: parseInt(val) }).run()
            }
          }
        },
        { type: 'divider' },
        {
          type: 'button',
          name: 'bold',
          tooltip: '加粗',
          icon: svg('bold'),
          isActive: (ed) => ed.isActive('bold'),
          action: (ed) => ed.chain().focus().toggleBold().run()
        },
        {
          type: 'button',
          name: 'italic',
          tooltip: '斜体',
          icon: svg('italic'),
          isActive: (ed) => ed.isActive('italic'),
          action: (ed) => ed.chain().focus().toggleItalic().run()
        },
        {
          type: 'button',
          name: 'underline',
          tooltip: '下划线',
          icon: svg('underline'),
          isActive: (ed) => ed.isActive('underline'),
          action: (ed) => ed.chain().focus().toggleUnderline().run()
        },
        {
          type: 'group',
          name: 'moreStyles',
          tooltip: '更多样式',
          icon: svg('moreStyles'),
          items: [
            {
              name: 'strike',
              tooltip: '删除线',
              icon: svg('strike'),
              isActive: (ed) => ed.isActive('strike'),
              action: (ed) => ed.chain().focus().toggleStrike().run()
            },
            {
              name: 'code',
              tooltip: '行内代码',
              icon: svg('inlineCode'),
              isActive: (ed) => ed.isActive('code'),
              action: (ed) => ed.chain().focus().toggleCode().run()
            },
            {
              name: 'superscript',
              tooltip: '上标',
              icon: svg('superscript'),
              isActive: (ed) => ed.isActive('superscript'),
              action: (ed) => ed.chain().focus().toggleSuperscript().run()
            },
            {
              name: 'subscript',
              tooltip: '下标',
              icon: svg('subscript'),
              isActive: (ed) => ed.isActive('subscript'),
              action: (ed) => ed.chain().focus().toggleSubscript().run()
            },
            {
              name: 'clearFormat',
              tooltip: '清除格式',
              icon: svg('clearFormat'),
              action: (ed) => ed.chain().focus().unsetAllMarks().run()
            }
          ]
        },
        { type: 'divider' },
        {
          type: 'color',
          name: 'textColor',
          tooltip: '文字颜色',
          getValue: (ed) => ed.getAttributes('textStyle').color || '#000000',
          onChange: (ed, val) => ed.chain().focus().setColor(val).run()
        },
        {
          type: 'color',
          name: 'bgColor',
          tooltip: '背景颜色',
          getValue: (ed) => ed.getAttributes('highlight').color || 'transparent',
          onChange: (ed, val) => ed.chain().focus().toggleHighlight({ color: val }).run()
        },
        { type: 'divider' },
        {
          type: 'select',
          name: 'fontSize',
          placeholder: '字号',
          className: 'tiptap-toolbar-select tiptap-toolbar-select-sm',
          options: [
            { label: '默认', value: '' },
            { label: '12px', value: '12px' },
            { label: '14px', value: '14px' },
            { label: '16px', value: '16px' },
            { label: '18px', value: '18px' },
            { label: '20px', value: '20px' },
            { label: '24px', value: '24px' },
            { label: '28px', value: '28px' },
            { label: '32px', value: '32px' },
            { label: '36px', value: '36px' }
          ],
          getValue: (ed) => ed.getAttributes('textStyle').fontSize || '',
          onChange: (ed, val) => {
            if (val) {
              ed.chain().focus().setFontSize(val).run()
            } else {
              ed.chain().focus().unsetFontSize().run()
            }
          }
        },
        {
          type: 'select',
          name: 'lineHeight',
          placeholder: '行高',
          className: 'tiptap-toolbar-select tiptap-toolbar-select-sm',
          options: [
            { label: '默认', value: '' },
            { label: '1', value: '1' },
            { label: '1.15', value: '1.15' },
            { label: '1.5', value: '1.5' },
            { label: '1.75', value: '1.75' },
            { label: '2', value: '2' },
            { label: '2.5', value: '2.5' },
            { label: '3', value: '3' }
          ],
          getValue: (ed) => {
            const paraAttrs = ed.getAttributes('paragraph')
            const headAttrs = ed.getAttributes('heading')
            return paraAttrs.lineHeight || headAttrs.lineHeight || ''
          },
          onChange: (ed, val) => {
            if (val) {
              ed.chain().focus().setLineHeight(val).run()
            } else {
              ed.chain().focus().unsetLineHeight().run()
            }
          }
        },
        {
          type: 'select',
          name: 'fontFamily',
          placeholder: '字体',
          className: 'tiptap-toolbar-select',
          options: [
            { label: '默认', value: '' },
            { label: '黑体', value: 'SimHei' },
            { label: '宋体', value: 'SimSun' },
            { label: '楷体', value: 'KaiTi' },
            { label: '微软雅黑', value: 'Microsoft YaHei' },
            { label: 'Arial', value: 'Arial' },
            { label: 'Tahoma', value: 'Tahoma' },
            { label: 'Verdana', value: 'Verdana' },
            { label: 'Georgia', value: 'Georgia' },
            { label: 'Times New Roman', value: 'Times New Roman' },
            { label: 'Courier New', value: 'Courier New' }
          ],
          getValue: (ed) => ed.getAttributes('textStyle').fontFamily || '',
          onChange: (ed, val) => {
            if (val) {
              ed.chain().focus().setFontFamily(val).run()
            } else {
              ed.chain().focus().unsetFontFamily().run()
            }
          }
        }
      ],

      // Row 2: Structure, lists, alignment, media, undo/redo, extras
      [
        {
          type: 'button',
          name: 'blockquote',
          tooltip: '引用',
          icon: svg('quote'),
          isActive: (ed) => ed.isActive('blockquote'),
          action: (ed) => ed.chain().focus().toggleBlockquote().run()
        },
        { type: 'divider' },
        {
          type: 'button',
          name: 'bulletList',
          tooltip: '无序列表',
          icon: svg('bulletList'),
          isActive: (ed) => ed.isActive('bulletList'),
          action: (ed) => ed.chain().focus().toggleBulletList().run()
        },
        {
          type: 'button',
          name: 'orderedList',
          tooltip: '有序列表',
          icon: svg('orderedList'),
          isActive: (ed) => ed.isActive('orderedList'),
          action: (ed) => ed.chain().focus().toggleOrderedList().run()
        },
        {
          type: 'button',
          name: 'taskList',
          tooltip: '任务列表',
          icon: svg('taskList'),
          isActive: (ed) => ed.isActive('taskList'),
          action: (ed) => ed.chain().focus().toggleTaskList().run()
        },
        { type: 'divider' },
        {
          type: 'group',
          name: 'alignment',
          tooltip: '对齐',
          icon: svg('alignLeft'),
          isActive: (ed) =>
            ed.isActive({ textAlign: 'center' }) ||
            ed.isActive({ textAlign: 'right' }) ||
            ed.isActive({ textAlign: 'justify' }),
          items: [
            {
              name: 'alignLeft',
              tooltip: '左对齐',
              icon: svg('alignLeft'),
              isActive: (ed) => ed.isActive({ textAlign: 'left' }),
              action: (ed) => ed.chain().focus().setTextAlign('left').run()
            },
            {
              name: 'alignCenter',
              tooltip: '居中',
              icon: svg('alignCenter'),
              isActive: (ed) => ed.isActive({ textAlign: 'center' }),
              action: (ed) => ed.chain().focus().setTextAlign('center').run()
            },
            {
              name: 'alignRight',
              tooltip: '右对齐',
              icon: svg('alignRight'),
              isActive: (ed) => ed.isActive({ textAlign: 'right' }),
              action: (ed) => ed.chain().focus().setTextAlign('right').run()
            },
            {
              name: 'alignJustify',
              tooltip: '两端对齐',
              icon: svg('alignJustify'),
              isActive: (ed) => ed.isActive({ textAlign: 'justify' }),
              action: (ed) => ed.chain().focus().setTextAlign('justify').run()
            }
          ]
        },
        {
          type: 'group',
          name: 'indentation',
          tooltip: '缩进',
          icon: svg('indent'),
          items: [
            {
              name: 'indent',
              tooltip: '增加缩进',
              icon: svg('indent'),
              action: (ed) => ed.chain().focus().increaseIndent().run()
            },
            {
              name: 'outdent',
              tooltip: '减少缩进',
              icon: svg('outdent'),
              action: (ed) => ed.chain().focus().decreaseIndent().run()
            }
          ]
        },
        { type: 'divider' },
        {
          type: 'emoji',
          name: 'emoji',
          tooltip: '表情',
          icon: svg('emoji')
        },
        {
          type: 'button',
          name: 'link',
          tooltip: '链接',
          icon: icon('Link'),
          isActive: (ed) => ed.isActive('link'),
          action: () => setLink()
        },
        {
          type: 'group',
          name: 'imageGroup',
          tooltip: '图片',
          icon: icon('Picture'),
          items: [
            {
              name: 'imageUpload',
              tooltip: '上传图片',
              icon: icon('Picture'),
              emitEvent: 'open-image-upload'
            },
            {
              name: 'imageGroupUpload',
              tooltip: '图片组',
              icon: icon('PictureFilled'),
              emitEvent: 'open-image-group-upload',
              isPostOnly: true
            },
            {
              name: 'panorama360',
              tooltip: '360°全景',
              icon: svg('globe'),
              emitEvent: 'open-panorama360-upload',
              isPostOnly: true
            }
          ]
        },
        {
          type: 'group',
          name: 'videoGroup',
          tooltip: '视频',
          icon: icon('VideoPlay'),
          items: [
            {
              name: 'videoUpload',
              tooltip: '上传视频',
              icon: icon('VideoPlay'),
              emitEvent: 'open-video-upload'
            },
            {
              name: 'videoUrl',
              tooltip: '插入视频链接',
              icon: icon('VideoCamera'),
              emitEvent: 'insert-video-url'
            }
          ]
        },
        {
          type: 'button',
          name: 'table',
          tooltip: '插入表格',
          icon: svg('table'),
          action: (ed) =>
            ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        },
        {
          type: 'group',
          name: 'codeBlockGroup',
          tooltip: '代码块',
          icon: svg('codeBlock'),
          popoverWidth: 200,
          isActive: (ed) => ed.isActive('codeBlock'),
          items: codeLangs.map((lang) => ({
            name: 'code-' + lang.value,
            tooltip: lang.text,
            action: () => insertCodeBlock(lang.value)
          }))
        },
        {
          type: 'button',
          name: 'hr',
          tooltip: '分割线',
          icon: svg('hr'),
          action: (ed) => ed.chain().focus().setHorizontalRule().run()
        },
        { type: 'divider' },
        {
          type: 'button',
          name: 'undo',
          tooltip: '撤销',
          icon: icon('RefreshLeft'),
          disabled: (ed) => !ed.can().undo(),
          action: (ed) => ed.chain().focus().undo().run()
        },
        {
          type: 'button',
          name: 'redo',
          tooltip: '重做',
          icon: icon('RefreshRight'),
          disabled: (ed) => !ed.can().redo(),
          action: (ed) => ed.chain().focus().redo().run()
        },
        { type: 'divider' },
        {
          type: 'button',
          name: 'eventspan',
          tooltip: '活动链接',
          icon: icon('Calendar'),
          emitEvent: 'open-event-dialog',
          isPostOnly: true
        },
        {
          type: 'group',
          name: 'contentBlock',
          tooltip: '内容块',
          icon: svg('contentBlock'),
          isPostOnly: true,
          items: [
            {
              name: 'contentBlock-bangumi',
              tooltip: '番剧',
              icon: svg('bangumi'),
              emitEvent: 'insert-content-block',
              emitData: 'bangumi',
              isPostOnly: true
            },
            {
              name: 'contentBlock-movie',
              tooltip: '电影',
              icon: svg('movie'),
              emitEvent: 'insert-content-block',
              emitData: 'movie',
              isPostOnly: true
            },
            {
              name: 'contentBlock-book',
              tooltip: '书籍',
              icon: svg('book'),
              emitEvent: 'insert-content-block',
              emitData: 'book',
              isPostOnly: true
            },
            {
              name: 'contentBlock-game',
              tooltip: '游戏',
              icon: svg('game'),
              emitEvent: 'insert-content-block',
              emitData: 'game',
              isPostOnly: true
            },
            {
              name: 'contentBlock-vote',
              tooltip: '投票',
              icon: svg('vote'),
              emitEvent: 'insert-content-block',
              emitData: 'vote',
              isPostOnly: true
            }
          ]
        },
        { type: 'divider' },
        {
          type: 'button',
          name: 'fullScreen',
          tooltip: '全屏',
          icon: icon('FullScreen'),
          isActive: () => props.isFullScreen,
          emitEvent: 'toggle-full-screen'
        }
      ]
    ]

    // Filter rows based on isPost and clean up dividers
    const cleanDividers = (items) => {
      const result = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type === 'divider') {
          // Skip leading dividers and adjacent dividers
          if (result.length === 0) continue
          if (result[result.length - 1].type === 'divider') continue
        }
        result.push(item)
      }
      // Remove trailing divider
      while (result.length > 0 && result[result.length - 1].type === 'divider') {
        result.pop()
      }
      return result
    }

    const renderedRows = computed(() => {
      return toolbarRows.map((row) => {
        const filtered = []
        for (let i = 0; i < row.length; i++) {
          const item = row[i]
          // Skip isPostOnly items when not post mode
          if (item.isPostOnly && !props.isPost) continue

          if (item.type === 'group') {
            // Filter group sub-items
            const filteredItems = item.items.filter((sub) => {
              if (sub.isPostOnly && !props.isPost) return false
              return true
            })
            if (filteredItems.length === 0) continue
            filtered.push(Object.assign({}, item, { items: filteredItems }))
          } else {
            filtered.push(item)
          }
        }
        return cleanDividers(filtered)
      })
    })

    // Reactivity-aware helpers that access editorState to trigger re-render
    const checkActive = (item) => {
      // Access editorState to create reactive dependency
      editorState.value // eslint-disable-line no-unused-expressions
      if (!props.editor || !item.isActive) return false
      return item.isActive(props.editor)
    }

    const checkGroupActive = (item) => {
      editorState.value // eslint-disable-line no-unused-expressions
      if (!props.editor || !item.isActive) return false
      return item.isActive(props.editor)
    }

    const checkDisabled = (item) => {
      editorState.value // eslint-disable-line no-unused-expressions
      if (!props.editor || !item.disabled) return false
      return item.disabled(props.editor)
    }

    const getSelectValue = (item) => {
      editorState.value // eslint-disable-line no-unused-expressions
      if (!props.editor || !item.getValue) return ''
      return item.getValue(props.editor)
    }

    const getColorValue = (item) => {
      editorState.value // eslint-disable-line no-unused-expressions
      if (!props.editor || !item.getValue) return ''
      return item.getValue(props.editor)
    }

    const getGroupItems = (item) => {
      return item.items || []
    }

    // Action handlers
    const handleAction = (item) => {
      if (item.emitEvent) {
        if (item.emitData !== undefined) {
          emit(item.emitEvent, item.emitData)
        } else {
          emit(item.emitEvent)
        }
        return
      }
      if (item.action && props.editor) {
        item.action(props.editor)
      }
    }

    const handleSelectChange = (item, val) => {
      if (item.onChange && props.editor) {
        item.onChange(props.editor, val)
      }
    }

    const handleColorChange = (item, val) => {
      if (item.onChange && props.editor) {
        item.onChange(props.editor, val)
      }
    }

    return {
      editorState,
      emojiList,
      renderedRows,
      checkActive,
      checkGroupActive,
      checkDisabled,
      getSelectValue,
      getColorValue,
      getGroupItems,
      handleAction,
      handleSelectChange,
      handleColorChange,
      insertEmoji
    }
  }
}
</script>

<style>
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
.tiptap-btn-group {
  gap: 2px;
}
.tiptap-group-arrow {
  font-size: 10px;
  margin-left: 1px;
  opacity: 0.6;
  line-height: 1;
}
.tiptap-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  line-height: 1;
}
.tiptap-icon svg {
  display: block;
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
.tiptap-group-dropdown {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 300px;
  overflow-y: auto;
}
.tiptap-group-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  text-align: left;
  transition: background 0.2s;
}
.tiptap-group-item:hover {
  background: #e0e0e0;
}
.tiptap-group-item.is-active {
  background: #d0d0d0;
  color: var(--el-color-primary, #409eff);
}
.tiptap-group-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tiptap-group-item .el-icon {
  font-size: 16px;
}
.tiptap-group-item-label {
  white-space: nowrap;
}
.tiptap-group-popper {
  padding: 4px !important;
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
</style>
