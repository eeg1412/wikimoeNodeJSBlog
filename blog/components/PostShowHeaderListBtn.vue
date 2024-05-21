<template>
  <transition name="fade">
    <div
      class="common-right-tool-btn opacity-70 text-white hover:opacity-100"
      @click="onClick"
    >
      <UIcon name="i-heroicons-list-bullet" />
    </div>
  </transition>
</template>

<script setup>
const emits = defineEmits()
const onClick = () => {
  // emit
  emits('btnClick')
}
</script>

<style scoped></style>
