<template>
  <CommonDialog v-model:show="eventOpen">
    <template #title>
      <h3
        class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
      >
        <span
          class="page-event-block"
          :style="{
            backgroundColor: currentData.eventtype?.color
          }"
          v-if="currentData.eventtype"
          >{{ currentData.eventtype?.name }}</span
        >{{ currentData.title }}
      </h3>
    </template>
    <template #body>
      <!-- 时间 -->
      <div class="flex items-center">
        <div class="flex items-center">
          <WUIIcon name="i-heroicons-clock" />
        </div>
        <div class="text-gray-700 dark:text-gray-400 text-md ml-2">
          {{ formatDate(currentData.startTime) }} ~
          {{ formatDate(currentData.endTime) }}
        </div>
      </div>

      <!-- 内容 -->
      <HtmlContent :content="currentData.content" />
      <!-- 相关链接 urlList -->
      <div
        class="text-sm mb-2 mt-2 text-gray-500 flex-shrink-0"
        v-if="currentData.urlList.length > 0"
      >
        <a
          :href="url.url"
          target="_blank"
          class="inline-flex items-center text-primary-500 mr-2"
          v-for="(url, index) in currentData.urlList"
          :key="index"
        >
          <WUIIcon name="i-heroicons-link" class="align-middle mr-1" />
          {{ url.text }}
        </a>
      </div>
    </template>
  </CommonDialog>
</template>
<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentData: {
    type: Object,
    default: null
  }
})
const emits = defineEmits()
const eventOpen = computed({
  get: () => props.show,
  set: val => {
    emits('update:show', val)
  }
})
</script>
<style scoped></style>
