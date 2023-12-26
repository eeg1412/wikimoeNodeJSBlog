<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
    <a
      v-for="(item, index) in linkListData.list"
      :href="item.siteurl"
      target="_blank"
      :key="index"
      class="group flex border border-solid border-gray-200 rounded-lg p-3 transition-colors duration-200 hover:bg-primary-500"
    >
      <!-- icon -->
      <div class="w-16 h-16 flex-shrink-0">
        <img
          class="object-cover rounded-full"
          :src="item.icon"
          v-if="item.icon"
        />
        <UAvatar :alt="item.sitename" v-else size="2xl" />
      </div>
      <!-- info -->
      <div class="flex-grow ml-3">
        <div
          class="line-clamp-1 overflow-ellipsis overflow-hidden font-bold text-md group-hover:text-white"
        >
          <!-- sitename -->
          {{ item.sitename }}
        </div>
        <div
          class="line-clamp-2 overflow-ellipsis overflow-hidden h-10 leading-5 text-gray-500 group-hover:text-white"
        >
          <!-- description -->
          {{ item.description || '暂无描述' }}
        </div>
      </div>
    </a>
  </div>
</template>
<script setup>
import { getLinkListApi } from '@/api/link'
const [linkListDataResponse] = await Promise.all([getLinkListApi()])
const { data: linkListData } = linkListDataResponse
</script>
<style scoped></style>
