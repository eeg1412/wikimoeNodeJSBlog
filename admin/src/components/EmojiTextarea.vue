<template>
  <div class="w_10">
    <div class="w_10">
      <Emoji @emojiClick="emojiClick" @emojiBtnClick="emojiBtnClick" />
    </div>
    <el-input
      type="textarea"
      v-model="textAreacontent"
      :rows="rows"
      ref="contentRef"
    ></el-input>
  </div>
</template>
<script>
import { ref, nextTick, computed } from 'vue'
import Emoji from './Emoji.vue'
export default {
  components: {
    Emoji,
  },
  props: {
    // value
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 5,
    },
  },
  setup(props, { emit }) {
    const textAreacontent = computed({
      get() {
        return props.value
      },
      set(val) {
        emit('update:value', val)
      },
    })
    const contentRef = ref(null)
    const emojiClick = (item) => {
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
    return {
      textAreacontent,
      contentRef,
      emojiClick,
      emojiBtnClick,
    }
  },
}
</script>
<style lang=""></style>
