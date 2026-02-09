<template>
  <form @submit.prevent="onSubmit">
    <slot />
  </form>
</template>

<script setup>
const props = defineProps({
  state: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['submit'])

function onSubmit() {
  emit('submit', { data: props.state })
}
</script>
