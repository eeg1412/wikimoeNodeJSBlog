<template>
  <el-popover :width="290" trigger="click" v-model:visible="popoverShow">
    <template #reference>
      <el-button size="small" @click="emojiBtnClick">表情</el-button>
    </template>

    <div>
      <el-tabs type="border-card">
        <el-tab-pane
          v-for="(item, index) in emojiCom"
          :key="index"
          :label="item.label"
        >
          <div
            :key="seletedEmojiIndex"
            class="emoji-container custom-scroll scroll-not-hide"
          >
            <div v-if="item.emojis.length > 0">
              <div
                v-for="(item, index) in item.emojis"
                :key="index"
                class="emoji-item"
                @click="handleEmojiClick(item)"
              >
                {{ item }}
              </div>
            </div>
            <div v-else class="empty-emoji">暂无表情</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-popover>
</template>
<script setup>
import emojiList from '@/utils/emoji.json'
import { ref, computed } from 'vue'

const emits = defineEmits()
const emoji = emojiList
// 常用emoji
const usedEmoji = ref([])
const emojiCom = computed(() => {
  let emojiAll = []
  const base = {
    groupName: '常用',
    emojis: [],
  }
  if (usedEmoji.value.length > 0) {
    base.emojis = usedEmoji.value
  }
  emojiAll.push(base)
  emojiAll = emojiAll.concat(JSON.parse(JSON.stringify(emoji)))
  // 将groupName 转换成 label
  emojiAll.forEach((item) => {
    item.label = item.groupName
    delete item.groupName
  })
  return emojiAll
})
const popoverShow = ref(false)
const seletedEmojiIndex = ref(0)
const handleEmojiClick = (item) => {
  emits('emojiClick', item)
  setUsedEmoji(item)
  popoverShow.value = false
}
const getUsedEmoji = () => {
  const usedEmojiStr = localStorage.getItem('usedEmoji')
  if (usedEmojiStr) {
    try {
      usedEmoji.value = JSON.parse(usedEmojiStr)
    } catch (error) {
      console.log(error)
    }
  }
}
const setUsedEmoji = (item) => {
  const index = usedEmoji.value.findIndex((i) => i === item)
  if (index !== -1) {
    usedEmoji.value.splice(index, 1)
  }
  usedEmoji.value.unshift(item)
  usedEmoji.value = usedEmoji.value.slice(0, 100)
  localStorage.setItem('usedEmoji', JSON.stringify(usedEmoji.value))
}
const emojiBtnClick = () => {
  emojiInit()
  emits('emojiBtnClick')
}
const emojiInit = () => {
  getUsedEmoji()
  // 如果是常用的emoji没有emoji，则默认选中第一个
  if (usedEmoji.value.length === 0) {
    seletedEmojiIndex.value = 1
  }
}
</script>
<style scoped>
.emoji-container {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  flex-grow: 1;
  overflow: auto;
  height: 296px;
}

.emoji-item {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  margin-right: 0.25rem;
  display: inline-block;
  cursor: pointer;
  border-radius: 0.375rem;
  min-width: 32px;
  min-height: 28px;
  line-height: 28px;
  text-align: center;
  font-size: 14px;
}
.emoji-item:hover {
  background-color: #f3f4f6;
}

.empty-emoji {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #9ca3af;
}
</style>
