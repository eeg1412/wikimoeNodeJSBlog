<template>
  <div class="flex content-h-170 acgn-item-body">
    <div class="flex-shrink-0 relative bangumi-cover-body">
      <div
        class="acgn-item-cover-body relative content-h-139 flex justify-center items-center border border-solid border-gray-300 rounded-md p-1"
      >
        <WikimoeImage
          class="max-image rounded bangumi-cover"
          :src="bangumi.cover || '/img/nopic400-565.png'"
          :alt="bangumi.title"
          :data-href="bangumi.cover"
          :data-href-list="
            bangumi.cover ? setDataHrefList(bangumi.cover) : null
          "
          loading="lazy"
          fit="contain"
        />
        <div
          class="absolute bottom-0 left-0 p-1"
          v-if="bangumi.label?.length > 0"
        >
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
    <div class="acgn-right-content content-h-170 custom-scroll">
      <div class="w-full flex flex-col">
        <div class="font-bold mb-1 flex-shrink-0">
          {{ bangumi.title }}
        </div>
        <div
          class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
        >
          <UIcon
            name="i-heroicons-calendar-20-solid"
            class="align-middle acgn-time-icon"
          />{{ bangumi.year }}年{{ seasonToName(bangumi.season) }}
        </div>
        <div
          class="text-sm mb-1 text-gray-400 flex-shrink-0 w_10 flex items-center"
          v-if="bangumi.giveUp"
        >
          <UIcon
            name="i-heroicons-bookmark-slash"
            class="align-middle mr-1"
          />已弃坑
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
        <div class="acg-summary">
          <!-- prettier-ignore -->
          <div class="text-sm whitespace-pre-line text-gray-500 overflow-auto custom-scroll flex-grow" v-if="bangumi.summary">{{ bangumi.summary }}</div>
          <div v-else class="text-sm text-gray-400">暂无内容</div>
        </div>
      </div>
    </div>
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
    },
  ]
}
</script>
<style scoped>
.bangumi-cover-body {
  width: 100px;
}
.bangumi-platform-block {
  color: #fff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
  border-radius: 5px;
}
</style>
