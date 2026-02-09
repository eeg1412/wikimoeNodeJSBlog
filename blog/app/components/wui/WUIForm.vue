<template>
  <form @submit.prevent="$emit('submit', $event)">
    <slot />
  </form>
</template>

<script setup>
defineProps({
  state: { type: Object, default: () => ({}) }
})
defineEmits(['submit'])
</script>
