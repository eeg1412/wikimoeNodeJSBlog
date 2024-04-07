<template>
  <div class="flex content-h-170">
    <div class="flex-shrink-0 relative game-cover-body">
      <div
        class="relative content-h-139 flex justify-center items-center border border-solid border-gray-300 rounded-md p-1"
      >
        <WikimoeImage
          class="w-full rounded game-cover"
          :src="game.cover || '/img/nopic400-565.png'"
          :alt="game.title"
          :width="400"
          :height="565"
          :data-href="game.cover"
          :data-href-list="game.cover ? setDataHrefList(game.cover) : null"
          loading="lazy"
          fit="contain"
        />
        <div class="absolute bottom-0 left-0 p-1">
          <UBadge
            v-for="(label, index) in game.label"
            :key="index"
            size="xs"
            class="mr-1"
          >
            {{ label }}
          </UBadge>
        </div>
      </div>
      <Rating :rating="game.rating" />
    </div>
    <div class="acg-right-content content-h-170 custom-scroll">
      <div class="w-full flex flex-col">
        <div class="font-bold mb-1 line-clamp-2 flex-shrink-0">
          <span
            class="games-platform-block"
            :style="{
              backgroundColor: game.gamePlatform.color,
            }"
            v-if="game.gamePlatform"
            >{{ game.gamePlatform.name }}</span
          >{{ game.title }}
        </div>
        <!-- 链接 -->
        <div
          class="text-sm mb-1 text-gray-500 flex-shrink-0"
          v-if="game.urlList.length > 0 || game.screenshotAlbum"
        >
          <a
            :href="url.url"
            target="_blank"
            class="inline-flex items-center text-primary mr-2"
            v-for="(url, index) in game.urlList"
            :key="index"
          >
            <UIcon name="i-heroicons-link" class="align-middle mr-1" />
            {{ url.text }}
          </a>
          <a
            href="javascript:;"
            class="inline-flex items-center text-primary mr-2"
            v-if="game.screenshotAlbum"
            @click="showAlbum(game.screenshotAlbum._id)"
          >
            <UIcon name="i-heroicons-photo" class="align-middle mr-1" />
            相关截图
          </a>
        </div>
        <div
          class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
          v-if="game.giveUp"
        >
          <UIcon
            name="i-heroicons-bookmark-slash"
            class="align-middle mr-1"
          />已弃坑
        </div>
        <!-- 用时 -->
        <UPopover
          :popper="{ offsetDistance: 0, placement: 'bottom-start' }"
          v-if="game.startTime && !game.giveUp"
        >
          <div
            class="text-sm mb-1 text-gray-400 flex-shrink-0 pointer w_10 flex items-center"
          >
            <UIcon name="i-heroicons-clock" class="align-middle mr-1" />用时{{
              getACGDuration(game.startTime, game.endTime)
            }}
          </div>
          <template #panel>
            <div class="px-2 py-1">
              {{
                `${formatDate(game.startTime)} ~ ${
                  game.endTime ? formatDate(game.endTime) : '至今'
                }`
              }}
            </div>
          </template>
        </UPopover>
        <div class="acg-summary">
          <!-- prettier-ignore -->
          <div class="text-sm whitespace-pre-line text-gray-500 flex-grow" v-if="game.summary">{{ game.summary }}</div>
          <div v-else class="text-sm flex-grow text-gray-400">暂无简评</div>
        </div>
      </div>
    </div>
  </div>

  <AlbumPhotoSwipe ref="AlbumPhotoSwipeRef" :albumId="activeAlbumId" />
</template>
<script setup>
const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
})

const setDataHrefList = (cover) => {
  return [
    {
      filepath: cover,
    },
  ]
}

// 相册
const activeAlbumId = ref('')
const AlbumPhotoSwipeRef = ref(null)

const showAlbum = (id) => {
  activeAlbumId.value = id
  nextTick(() => {
    AlbumPhotoSwipeRef.value.open()
  })
}
</script>
<style scoped>
.game-cover-body {
  width: 100px;
}
.games-platform-block {
  color: #fff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
  border-radius: 5px;
}
</style>
