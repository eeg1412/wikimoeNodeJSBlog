<template>
  <div
    class="wui-tabs"
    :class="{ 'wui-tabs-vertical': orientation === 'vertical' }"
  >
    <div class="wui-tabs-list" role="tablist">
      <button
        v-for="(item, index) in items"
        :key="index"
        role="tab"
        class="wui-tab-trigger"
        :class="{ 'wui-tab-trigger-active': modelValue === index }"
        @click="$emit('update:modelValue', index)"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="wui-tabs-content">
      <slot :selected="modelValue" :item="items[modelValue]" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  modelValue: { type: Number, default: 0 },
  orientation: { type: String, default: 'horizontal' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.wui-tabs {
  @apply flex flex-col;
}

.wui-tabs-vertical {
  @apply flex-row;
}

.wui-tabs-list {
  @apply flex border-b border-gray-200 dark:border-gray-700;
}

.wui-tabs-vertical .wui-tabs-list {
  @apply flex-col border-b-0 border-r border-gray-200 dark:border-gray-700;
}

.wui-tab-trigger {
  @apply px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer
    text-gray-500 dark:text-gray-400
    hover:text-gray-700 dark:hover:text-gray-200
    hover:bg-gray-50 dark:hover:bg-gray-800
    border-b-2 border-transparent
    transition-colors duration-150;
}

.wui-tabs-vertical .wui-tab-trigger {
  @apply border-b-0 border-r-2 text-left;
}

.wui-tab-trigger-active {
  @apply text-primary-500 dark:text-primary-400
    border-primary-500 dark:border-primary-400;
}

.wui-tabs-content {
  @apply flex-1;
}
</style>
