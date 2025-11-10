<template>
  <div class="mt-3">
    <div
      v-for="bangumi in bangumiSeasonList"
      :key="bangumi._id"
      class="acgn-sidebar-item-body"
    >
      <div class="acgn-sidebar-item">
        <BangumiItem :bangumi="bangumi" />
      </div>
    </div>
    <div
      class="text-center py-4 text-gray-500"
      v-if="bangumiSeasonList.length === 0"
    >
      <div>暂无内容</div>
    </div>
  </div>
</template>
<script setup>
import { getBangumiSeasonListApi } from '@/api/bangumi'

const { data: bangumiSeasonList } = await getBangumiSeasonListApi()
</script>
<style scoped></style>
