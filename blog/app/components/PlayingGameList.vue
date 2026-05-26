<template>
  <div class="mt-3">
    <div
      v-for="game in playingGameList"
      :key="game._id"
      class="acgn-sidebar-item-body"
    >
      <div class="acgn-sidebar-item">
        <GameItem
          :game="game"
          :showAnimeDot="false"
          :enableSummaryToggle="true"
        />
      </div>
    </div>
    <div
      class="text-center py-4 text-gray-500"
      v-if="playingGameList.length === 0"
    >
      <div>{{ t('common.status.empty') }}</div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  playingGameList: {
    type: Array,
    default: () => []
  }
})

const { t } = useLang()
</script>
<style scoped></style>
