<template>
  <div class="w_10">
    <div class="w_10 emoji-textarea-toolbar">
      <Emoji @emojiClick="emojiClick" @emojiBtnClick="emojiBtnClick" />
      <AdminStickerPicker
        v-if="showStickerPicker"
        @stickerClick="handleStickerClick"
        @stickerBtnClick="emojiBtnClick"
        :maxCount="maxStickers"
        :currentCount="stickers.length"
        :selectedIds="stickers.map(s => s._id)"
      />
    </div>
    <el-input
      type="textarea"
      v-model="textAreacontent"
      :rows="rows"
      :placeholder="placeholder"
      ref="contentRef"
      @blur="$emit('blur')"
    ></el-input>
    <!-- 已选贴纸展示 -->
    <div
      class="emoji-textarea-stickers"
      v-if="showStickerPicker && stickers.length > 0"
    >
      <div
        class="emoji-textarea-sticker-item"
        v-for="(sticker, index) in stickers"
        :key="index"
      >
        <img
          :src="sticker.image"
          :alt="sticker.description"
          class="emoji-textarea-sticker-img"
        />
        <div
          class="emoji-textarea-sticker-remove"
          @click="removeSticker(index)"
        >
          <i class="fas fa-times"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, nextTick, computed } from 'vue'
import Emoji from './Emoji.vue'
import AdminStickerPicker from './AdminStickerPicker.vue'
export default {
  components: {
    Emoji,
    AdminStickerPicker
  },
  emits: ['blur', 'update:value', 'update:stickers'],
  props: {
    // value
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    rows: {
      type: Number,
      default: 5
    },
    stickers: {
      type: Array,
      default: () => []
    },
    maxStickers: {
      type: Number,
      default: 3
    },
    showStickerPicker: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const textAreacontent = computed({
      get() {
        return props.value
      },
      set(val) {
        emit('update:value', val)
      }
    })
    const contentRef = ref(null)
    const emojiClick = item => {
      console.log(contentRef.value)
      const content = textAreacontent.value
      const start = contentRef.value.textarea.selectionStart
      const end = contentRef.value.textarea.selectionEnd
      textAreacontent.value =
        content.slice(0, start) + item + content.slice(end)
      nextTick(() => {
        contentRef.value.textarea.focus()
        const newCursorPos = start + item.length
        contentRef.value.textarea.selectionStart = newCursorPos
        contentRef.value.textarea.selectionEnd = newCursorPos
      })
    }
    const emojiBtnClick = () => {
      // 失去焦点
      contentRef.value.textarea.blur()
    }
    const handleStickerClick = sticker => {
      const current = [...props.stickers]
      if (props.maxStickers > 0 && current.length >= props.maxStickers) return
      current.push(sticker)
      emit('update:stickers', current)
    }
    const removeSticker = index => {
      const current = [...props.stickers]
      current.splice(index, 1)
      emit('update:stickers', current)
    }
    return {
      textAreacontent,
      contentRef,
      emojiClick,
      emojiBtnClick,
      handleStickerClick,
      removeSticker
    }
  }
}
</script>
<style scoped>
.emoji-textarea-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.emoji-textarea-toolbar :deep(.el-button) {
  margin-left: 0px !important;
}
.emoji-textarea-stickers {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.emoji-textarea-sticker-item {
  position: relative;
  width: 33.3333%;
  max-width: 128px;
  height: auto;
  aspect-ratio: 1;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
.emoji-textarea-sticker-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
}
.emoji-textarea-sticker-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--el-color-danger);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  line-height: 1;
}
</style>
