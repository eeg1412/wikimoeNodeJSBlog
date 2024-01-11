<template>
  <UPopover :popper="{ arrow: true }">
    <UButton color="white" variant="solid" size="xs" @click="emojiBtnClick"
      >表情</UButton
    >
    <template #panel="{ close }">
      <div class="p-2 w-[480px] flex max-w-[90vw]">
        <div>
          <UTabs
            v-model="seletedEmojiIndex"
            :items="emojiCom"
            orientation="vertical"
            class="w-[75px]"
          ></UTabs>
        </div>
        <div
          :key="seletedEmojiIndex"
          class="pl-2 pr-2 flex-grow overflow-auto h-[296px] custom-scroll scroll-not-hide"
        >
          <div v-if="emojiCom[seletedEmojiIndex].emojis.length > 0">
            <div
              v-for="(item, index) in emojiCom[seletedEmojiIndex].emojis"
              :key="index"
              class="p-2 mb-1 mr-1 inline-block hover:shadow cursor-pointer rounded-lg min-w-[40px] min-h-[40px] text-center"
              @click="handleEmojiClick(item, close)"
            >
              {{ item }}
            </div>
          </div>
          <div
            v-else
            class="flex justify-center items-center h-full text-gray-400"
          >
            暂无表情
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
<script setup>
const emits = defineEmits()
const emoji = getEmoji()
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
const seletedEmojiIndex = ref(0)
const handleEmojiClick = (item, close) => {
  emits('emojiClick', item)
  setUsedEmoji(item)
  close()
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
<style></style>
