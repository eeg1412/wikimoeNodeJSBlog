<template>
  <div class="flex content-h-170 acgn-item-body">
    <div class="flex-shrink-0 relative movie-cover-body">
      <div
        class="acgn-item-cover-body relative content-h-139 flex justify-center items-center border border-solid border-gray-300 rounded-md p-1"
      >
        <WikimoeImage
          class="max-image rounded movie-cover"
          :src="movie.cover || '/img/nopic400-565.png'"
          :alt="movie.title"
          :data-href="movie.cover"
          :data-href-list="movie.cover ? setDataHrefList(movie.cover) : null"
          loading="lazy"
          fit="contain"
        />
        <div
          class="absolute bottom-0 left-0 p-1"
          v-if="movie.label?.length > 0"
        >
          <UBadge
            v-for="(label, index) in movie.label"
            :key="index"
            size="xs"
            class="mr-1"
          >
            {{ label }}
          </UBadge>
        </div>
      </div>
      <Rating :rating="movie.rating" />
    </div>
    <div class="acgn-right-content content-h-170 custom-scroll">
      <div class="w-full flex flex-col">
        <div class="font-bold mb-1 flex-shrink-0">
          <span class="movie-block bg-cyan-700" v-if="showType">电影</span
          >{{ movie.title }}
        </div>
        <div
          class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        >
          <UIcon
            name="i-heroicons-star"
            class="align-middle acgn-time-icon"
            v-if="watDate"
          />{{ watDate }}
        </div>
        <!-- 链接 -->
        <div
          class="text-sm mb-1 text-gray-500 flex-shrink-0"
          v-if="movie.urlList.length > 0"
        >
          <a
            :href="url.url"
            target="_blank"
            class="inline-flex items-center text-primary mr-2"
            v-for="(url, index) in movie.urlList"
            :key="index"
          >
            <UIcon name="i-heroicons-link" class="align-middle mr-1" />
            {{ url.text }}
          </a>
        </div>
        <div class="acg-summary">
          <!-- prettier-ignore -->
          <div class="text-sm whitespace-pre-line text-gray-500 overflow-auto custom-scroll flex-grow" v-if="movie.summary">{{ movie.summary }}</div>
          <div v-else class="text-sm text-gray-400">暂无内容</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
  showType: {
    type: Boolean,
    default: false,
  },
})
const setDataHrefList = (cover) => {
  return [
    {
      filepath: cover,
    },
  ]
}
const watDate = computed(() => {
  if (props.movie.year && props.movie.month && props.movie.day) {
    return `${props.movie.year}年${props.movie.month}月${props.movie.day}日观看`
  }
  return ''
})
</script>
<style scoped>
.movie-cover-body {
  width: 100px;
}
.movie-block {
  color: #fff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
  border-radius: 5px;
}
</style>
