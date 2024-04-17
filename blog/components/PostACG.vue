<template>
  <div v-if="contentCount > 0" class="mt-4">
    <div
      class="mb-4 text-gray-600 font-bold text-base border-b border-dotted pb-3 border-gray-300"
    >
      相关作品：
    </div>
    <div
      class="grid gap-4"
      :class="{
        'grid-cols-1': contentCount === 1,
        'xl:grid-cols-2': contentCount > 1,
      }"
    >
      <div v-for="bangumi in bangumiList" :key="bangumi._id" class="mb-1">
        <BangumiItem :bangumi="bangumi" />
      </div>
      <div v-for="book in bookList" :key="book._id" class="mb-1">
        <BookItem :book="book" />
      </div>
      <div v-for="game in gameList" :key="game._id" class="mb-1">
        <GameItem :game="game" />
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  bangumiList: {
    type: Array,
    default() {
      return []
    },
  },
  gameList: {
    type: Array,
    default() {
      return []
    },
  },
  bookList: {
    type: Array,
    default() {
      return []
    },
  },
})
const contentCount = computed(() => {
  return (
    props.bangumiList.length + props.gameList.length + props.bookList.length
  )
})
</script>
<style scoped></style>
