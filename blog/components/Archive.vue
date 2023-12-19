<template>
  <div class="archive-list-content-body">
    <ul class="archive-list-body custom-scroll clearfix">
      <li
        v-for="(item, index) in archiveList"
        :key="index"
        class="archive-list-item fl"
      >
        <NuxtLink
          :to="{
            name: 'postListArchive',
            params: { year: item.year, month: item.month, page: 1 },
          }"
          class="archive-list-item-link common-a"
        >
          {{ item.year }}年{{ item.month }}月({{ item.count }})
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { getArchiveApi } from '@/api/post'
const [archiveData] = await Promise.all([getArchiveApi()])
const { data: archiveListData } = archiveData
// list 格式  { "_id": { "year": 2023, "month": 12 }, "count": 10 }
const archiveList = computed(() => {
  const list = archiveListData.value
  const newList = []
  // 遍历list，转换为 [{year: 2021, month: 12, count: 10}]，月份小于10的前面加0
  for (const key in list) {
    if (Object.hasOwnProperty.call(list, key)) {
      const item = list[key]
      const month = item._id.month < 10 ? `0${item._id.month}` : item._id.month
      newList.push({
        year: item._id.year,
        month: month,
        count: item.count,
      })
    }
  }

  return newList
})
</script>
<style scoped>
.archive-list-content-body {
  padding-top: 10px;
}
.archive-list-item {
  width: 50%;
}
.archive-list-body {
  max-height: 200px;
  overflow: auto;
}
.archive-list-item-link {
  display: inline-block;
  padding: 5px;
  font-size: 12px;
  transition: all 0.3s;
}
</style>
