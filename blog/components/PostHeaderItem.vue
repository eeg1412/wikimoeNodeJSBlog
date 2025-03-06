<template>
  <ul class="common-right-tool-menu-item-ul">
    <li v-for="(item, index) in list" :key="index">
      <div
        class="m-2 px-3 py-1 transition duration-300 hover:text-primary-400 hover:border-primary-500 border-solid border border-transparent cursor-pointer common-right-tool-menu-item-text rounded"
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
        @goToHeader="emitGoToHeader"
      />
    </li>
  </ul>
</template>
<script setup>
const emits = defineEmits()
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
  return `${props.deepLevel * 0.75}rem`
})
const goToHeader = (dom) => {
  const header = dom

  if (header) {
    window.scroll({
      top: header.offsetTop,
      behavior: 'smooth',
    })
    emitGoToHeader(header)
  }
}
const emitGoToHeader = (dom) => {
  emits('goToHeader', dom)
}
</script>
<style scoped></style>
