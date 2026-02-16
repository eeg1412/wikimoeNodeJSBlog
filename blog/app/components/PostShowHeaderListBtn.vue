<template>
  <transition name="fade">
    <div
      class="common-right-tool-btn opacity-70 text-white hover:opacity-100 common-focus-visible-btn-outline"
      @click="onClick"
      @keydown.enter="onClick"
      @keydown.esc="onEsc"
      tabindex="0"
    >
      <WUIIcon name="i-heroicons-list-bullet" />
    </div>
  </transition>
</template>

<script setup>
const emits = defineEmits(['btnClick', 'close'])
const onClick = () => {
  // emit
  emits('btnClick')
}
const onEsc = () => {
  emits('close')
}
</script>

<style scoped></style>
