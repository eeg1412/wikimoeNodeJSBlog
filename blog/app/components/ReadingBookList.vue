<template>
  <div class="mt-3">
    <div
      v-for="book in readingBookList"
      :key="book._id"
      class="acgn-sidebar-item-body"
    >
      <div class="acgn-sidebar-item">
        <BookItem
          :book="book"
          :showAnimeDot="false"
          :enableSummaryToggle="true"
        />
      </div>
    </div>
    <div
      class="text-center py-4 text-gray-500"
      v-if="readingBookList.length === 0"
    >
      <div>{{ t('common.status.empty') }}</div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  readingBookList: {
    type: Array,
    default: () => []
  }
})

const { t } = useLang()
</script>
<style scoped></style>
