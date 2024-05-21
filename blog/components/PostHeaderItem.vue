<template>
  <ul class="post-header-item-ul">
    <li v-for="(item, index) in list" :key="index">
      <div
        class="px-4 py-3 transition duration-300 hover:text-primary-400 hover:bg-gray-50 border-l-4 border-solid border-transparent cursor-pointer post-header-item-text"
        :style="{ paddingLeft }"
        @click="goToHeader(item.dom)"
        :class="{
          active: activeHeaderDom === item.dom,
        }"
      >
        {{ item.text }}
      </div>
      <PostHeaderItem
        :list="item.children"
        :deepLevel="deepLevel + 1"
        :activeHeaderDom="activeHeaderDom"
      />
    </li>
  </ul>
</template>
<script setup>
const props = defineProps({
  list: {
    type: Array,
    default() {
      return []
    },
  },
  deepLevel: {
    type: Number,
    default: 1,
  },
  activeHeaderDom: {
    type: Object,
    default: null,
  },
})
const paddingLeft = computed(() => {
  return `${props.deepLevel * 1}rem`
})
const goToHeader = (dom) => {
  const header = dom

  if (header) {
    window.scroll({
      top: header.offsetTop,
      behavior: 'smooth',
    })
  }
}
</script>
<style scoped></style>
