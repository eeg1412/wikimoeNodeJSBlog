<template>
  <transition name="fade">
    <div
      class="absolute inset-0 flex items-center justify-center bg-white z-10 text-primary-500 opacity-80"
      v-if="loading"
    >
      <UIcon class="animate-spin" name="i-heroicons-arrow-path" /><span
        class="ml-2"
        v-if="text"
        >{{ text }}</span
      >
    </div>
  </transition>
</template>
<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '',
  },
})
</script>
<style scoped></style>
