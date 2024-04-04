<template>
  <div class="flex-shrink-0 relative bangumi-cover-body">
    <div
      class="relative flex justify-center items-center border border-solid border-gray-300 rounded-md p-1"
    >
      <WikimoeImage
        class="w-full rounded bangumi-cover"
        :src="bangumi.cover || '/img/nopic400-565.png'"
        :alt="bangumi.title"
        :width="400"
        :height="565"
        :data-href="bangumi.cover"
        :data-href-list="bangumi.cover ? setDataHrefList(bangumi.cover) : null"
        loading="lazy"
        fit="cover"
      />
      <div class="absolute bottom-0 left-0 p-1">
        <UBadge
          v-for="(label, index) in bangumi.label"
          :key="index"
          size="xs"
          class="mr-1"
        >
          {{ label }}
        </UBadge>
      </div>
    </div>
    <Rating :rating="bangumi.rating" />
  </div>

  <div class="pl-2 w-full flex flex-col">
    <div class="font-bold mb-1 line-clamp-2 flex-shrink-0">
      {{ bangumi.title }}
    </div>
    <!-- 链接 -->
    <div
      class="text-sm mb-1 text-gray-500 flex-shrink-0"
      v-if="bangumi.urlList.length > 0"
    >
      <a
        :href="url.url"
        target="_blank"
        class="inline-flex items-center text-primary mr-2"
        v-for="(url, index) in bangumi.urlList"
        :key="index"
      >
        <UIcon name="i-heroicons-link" class="align-middle mr-1" />
        {{ url.text }}
      </a>
    </div>
    <div
      class="text-sm mb-1 text-gray-400 flex-shrink-0 pointer w_10 flex items-center"
    >
      <UIcon name="i-heroicons-calendar-20-solid" class="align-middle mr-1" />{{
        bangumi.year
      }}年{{ seasonToName(bangumi.season) }}
    </div>
    <!-- prettier-ignore -->
    <div class="text-sm whitespace-pre-line text-gray-500 overflow-auto custom-scroll flex-grow" v-if="bangumi.summary">{{ bangumi.summary }}</div>
    <div v-else class="text-sm text-gray-400">暂无简评</div>
  </div>
</template>
<script setup>
const props = defineProps({
  bangumi: {
    type: Object,
    required: true,
  },
})
const setDataHrefList = (cover) => {
  return [
    {
      filepath: cover,
      width: 400,
      height: 565,
    },
  ]
}
</script>
<style scoped>
.bangumi-cover-body {
  width: 100px;
}
</style>
