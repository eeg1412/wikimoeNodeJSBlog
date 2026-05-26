<template>
  <div class="mt-3">
    <div
      v-for="bangumi in bangumiSeasonList"
      :key="bangumi._id"
      class="acgn-sidebar-item-body"
    >
      <div class="acgn-sidebar-item">
        <BangumiItem :bangumi="bangumi" :enableSummaryToggle="true" />
      </div>
    </div>
    <div
      class="text-center py-4 text-gray-500"
      v-if="bangumiSeasonList.length === 0"
    >
      <div>{{ t('common.status.empty') }}</div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  bangumiSeasonList: {
    type: Array,
    default: () => []
  }
})

const { t } = useLang()
</script>
<style scoped></style>
