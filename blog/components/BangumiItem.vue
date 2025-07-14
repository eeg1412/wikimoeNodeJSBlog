<template>
  <LazyACGNItem
    v-if="bangumi"
    :item="bangumi"
    :badge="{
      name: '番剧',
      color: '#f472b6'
    }"
  >
    <template #options>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
      >
        <UIcon
          name="i-heroicons-calendar-20-solid"
          class="align-middle acgn-time-icon"
        />{{ bangumi.year }}年{{ seasonToName(bangumi.season) }}
      </div>
      <div
        class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        v-if="bangumi.giveUp"
      >
        <UIcon
          name="i-heroicons-bookmark-slash"
          class="align-middle mr-1"
        />已弃坑
      </div>
    </template>
  </LazyACGNItem>
</template>
<script setup>
const props = defineProps({
  bangumi: {
    type: Object,
    required: true
  }
})
</script>
<style scoped></style>
