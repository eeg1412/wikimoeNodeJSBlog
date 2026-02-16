<template>
  <transition name="fade">
    <div
      class="common-right-tool-btn opacity-70 text-white hover:opacity-100 common-focus-visible-btn-outline"
      @click="onClick"
      @keydown.enter="onClick"
      @keydown.esc="onEsc"
      tabindex="0"
    >
      <span v-if="postRouteType === 'blog'" class="text-sm system-ui-font"
        >博</span
      >
      <span v-else-if="postRouteType === 'tweet'" class="text-sm system-ui-font"
        >推</span
      >
      <WUIIcon name="i-heroicons-adjustments-horizontal" v-else />
    </div>
  </transition>
</template>

<script setup>
const route = useRoute()
const emits = defineEmits(['btnClick', 'close'])
const postRouteType = computed(() => route.params.type)
const onClick = () => {
  // emit
  emits('btnClick')
}
const onEsc = () => {
  emits('close')
}
</script>

<style scoped></style>
