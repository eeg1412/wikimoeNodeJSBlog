<template>
  <div
    class="wui-button-group"
    :class="[
      orientation === 'vertical' ? 'flex-col' : 'flex-row',
      $attrs.class
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  size: { type: String, default: 'md' },
  orientation: { type: String, default: 'horizontal' }
})
</script>

<style scoped>
.wui-button-group {
  @apply inline-flex;
}

.wui-button-group :deep(> *:not(:first-child):not(:last-child)) {
  @apply rounded-none;
}

.wui-button-group.flex-row :deep(> *:first-child) {
  @apply rounded-r-none;
}

.wui-button-group.flex-row :deep(> *:last-child) {
  @apply rounded-l-none;
}

.wui-button-group.flex-col :deep(> *:first-child) {
  @apply rounded-b-none;
}

.wui-button-group.flex-col :deep(> *:last-child) {
  @apply rounded-t-none;
}

/* Remove double borders */
.wui-button-group.flex-row :deep(> * + *) {
  @apply -ml-px;
}

.wui-button-group.flex-col :deep(> * + *) {
  @apply -mt-px;
}
</style>
