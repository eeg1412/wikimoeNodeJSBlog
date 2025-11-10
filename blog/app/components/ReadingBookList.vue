<template>
  <div class="mt-3">
    <div
      v-for="book in readingBookList"
      :key="book._id"
      class="acgn-sidebar-item-body"
    >
      <div class="acgn-sidebar-item">
        <BookItem :book="book" :showAnimeDot="false" />
      </div>
    </div>
    <div
      class="text-center py-4 text-gray-500"
      v-if="readingBookList.length === 0"
    >
      <div>暂无内容</div>
    </div>
  </div>
</template>
<script setup>
import { getBookReadingListApi } from '@/api/book'

const { data: readingBookList } = await getBookReadingListApi()
</script>
<style scoped></style>
