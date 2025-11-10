<template>
  <div class="mt-3">
    <div
      v-for="game in playingGameList"
      :key="game._id"
      class="acgn-sidebar-item-body"
    >
      <div class="acgn-sidebar-item">
        <GameItem :game="game" :showAnimeDot="false" />
      </div>
    </div>
    <div
      class="text-center py-4 text-gray-500"
      v-if="playingGameList.length === 0"
    >
      <div>暂无内容</div>
    </div>
  </div>
</template>
<script setup>
import { getGamePlayingListApi } from '@/api/game'

const { data: playingGameList } = await getGamePlayingListApi()
</script>
<style scoped></style>
